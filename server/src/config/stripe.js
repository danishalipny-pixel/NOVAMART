import Stripe from 'stripe';
import { config } from './env.js';

/**
 * Initialized Stripe SDK instance.
 */
export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: false
});

export default stripe;
