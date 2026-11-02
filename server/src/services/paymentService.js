import mongoose from 'mongoose';
import { stripe } from '../config/stripe.js';
import { config } from '../config/env.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const paymentService = {
  /**
   * Create or retrieve a Stripe PaymentIntent for an authenticated order.
   * Calculates the payable amount strictly from server-side order pricing.
   */
  createPaymentIntent: async (orderId, user) => {
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      throw ApiError.notFound(`Order "${orderId}" not found`);
    }

    // Customer Ownership Verification
    const currentUserId = (user.userId || user._id || user.id)?.toString();
    if (user.role === 'customer' && order.customer.toString() !== currentUserId) {
      throw ApiError.forbidden("Access denied: You cannot pay for another customer's order");
    }

    // Order State Validation
    if (order.status === 'cancelled') {
      throw ApiError.badRequest('Cannot process payment for a cancelled order');
    }

    if (order.payment && order.payment.status === 'captured') {
      throw ApiError.badRequest(
        `Order #${order.orderNumber} has already been paid and captured on ${order.payment.paidAt}`
      );
    }

    // Server-Side Calculation (never trust client values)
    const payableTotal = order.pricing.total;
    const amountInCents = Math.round(payableTotal * 100);

    if (amountInCents <= 0) {
      throw ApiError.badRequest('Payable order total must be greater than zero');
    }

    try {
      // Create Stripe PaymentIntent with order metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerId: user.userId,
          customerEmail: user.email
        },
        description: `NOVAMART Order #${order.orderNumber}`,
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Update Order with initial payment intent details
      order.payment.transactionId = paymentIntent.id;
      order.payment.status = 'pending';
      order.payment.method = 'stripe';
      await order.save();

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: payableTotal,
        amountCents: amountInCents,
        currency: 'usd',
        orderId: order._id,
        orderNumber: order.orderNumber,
        publishableKey: config.stripe.publishableKey
      };
    } catch (error) {
      logger.error('Stripe PaymentIntent creation failed:', error.message);
      throw ApiError.internal(`Payment gateway initialization failed: ${error.message}`);
    }
  },

  /**
   * Secure Stripe Webhook event processor with signature verification and idempotency.
   */
  handleWebhookEvent: async (rawBody, signatureHeader) => {
    if (!signatureHeader) {
      throw ApiError.badRequest('Missing Stripe signature header (stripe-signature)');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signatureHeader,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      throw ApiError.badRequest(`Webhook signature verification failed: ${err.message}`);
    }

    logger.info(`Received verified Stripe webhook event: [${event.type}] (ID: ${event.id})`);

    const eventObject = event.data.object;
    const orderId = eventObject.metadata?.orderId;
    let updatedOrder = null;

    switch (event.type) {
      case 'payment_intent.succeeded': {
        if (!orderId) {
          logger.warn('PaymentIntent succeeded but missing orderId metadata');
          break;
        }

        const order = await Order.findById(orderId);
        if (!order) {
          logger.error(`Order "${orderId}" referenced in payment_intent.succeeded not found`);
          break;
        }

        // Idempotency: Prevent duplicate event processing
        if (order.payment.status === 'captured') {
          logger.info(`Order #${order.orderNumber} already marked as captured. Skipping redundant update.`);
          return { received: true, duplicate: true, orderNumber: order.orderNumber };
        }

        order.payment.status = 'captured';
        order.payment.paidAt = new Date();
        order.payment.transactionId = eventObject.id;
        order.status = 'processing';
        await order.save();

        logger.info(`Order #${order.orderNumber} payment confirmed and marked as captured.`);
        updatedOrder = order;
        break;
      }

      case 'payment_intent.payment_failed': {
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.payment.status !== 'captured') {
            order.payment.status = 'failed';
            await order.save();
            logger.warn(`Order #${order.orderNumber} payment marked as failed.`);
            updatedOrder = order;
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.status !== 'cancelled') {
            // Restore inventory if payment was canceled
            for (const item of order.items) {
              const product = await Product.findById(item.product);
              if (product) {
                product.stock += item.quantity;
                await product.save();
              }
            }
            order.status = 'cancelled';
            order.payment.status = 'failed';
            order.cancelReason = 'Payment authorization cancelled by provider';
            await order.save();
            logger.info(`Order #${order.orderNumber} cancelled and inventory restored.`);
            updatedOrder = order;
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
        break;
    }

    return {
      received: true,
      eventType: event.type,
      orderNumber: updatedOrder?.orderNumber || null
    };
  },

  /**
   * Retrieve payment status for an order.
   */
  getOrderPaymentStatus: async (orderId, user) => {
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    } else {
      order = await Order.findOne({ orderNumber: orderId.toUpperCase() });
    }

    if (!order) {
      throw ApiError.notFound(`Order "${orderId}" not found`);
    }

    const currentUserId = (user.userId || user._id || user.id)?.toString();
    if (user.role === 'customer' && order.customer.toString() !== currentUserId) {
      throw ApiError.forbidden('Access denied');
    }

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      payment: order.payment,
      pricing: order.pricing,
      status: order.status
    };
  }
};

export default paymentService;
