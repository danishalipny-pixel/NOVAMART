import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

export const authService = {
  /**
   * Register a new user (Customer or Seller).
   */
  registerUser: async ({
    name,
    email,
    password,
    role = 'customer',
    storeName,
    storeSlug,
    description
  }) => {
    // Prevent public creation of admin accounts
    if (role === 'admin') {
      throw ApiError.forbidden('Administrative accounts cannot be registered publicly');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // Check seller store uniqueness if registering as seller
    if (role === 'seller') {
      const existingStore = await Seller.findOne({ storeSlug: storeSlug.toLowerCase().trim() });
      if (existingStore) {
        throw ApiError.conflict(`Store slug '${storeSlug}' is already taken. Please choose another.`);
      }
    }

    // Create user document (pre-save hook hashes the password)
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role === 'seller' ? 'seller' : 'customer'
    });

    await newUser.save();

    let createdSeller = null;
    if (role === 'seller') {
      createdSeller = new Seller({
        user: newUser._id,
        storeName: storeName.trim(),
        storeSlug: storeSlug.toLowerCase().trim(),
        description: description ? description.trim() : '',
        status: 'approved'
      });
      await createdSeller.save();

      newUser.sellerProfile = createdSeller._id;
      await newUser.save();
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: newUser._id.toString(),
      role: newUser.role,
      email: newUser.email,
      name: newUser.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: newUser._id.toString() });

    const userResponse = newUser.toJSON();
    if (createdSeller) {
      userResponse.sellerProfile = createdSeller.toJSON();
    }

    return {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  },

  /**
   * Authenticate user credentials and return tokens.
   */
  loginUser: async ({ email, password }) => {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account status
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    // Populate seller profile if applicable
    if (user.sellerProfile) {
      await user.populate('sellerProfile');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    return {
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    };
  },

  /**
   * Retrieve current authenticated user profile.
   */
  getCurrentUser: async (userId) => {
    const user = await User.findById(userId).populate('sellerProfile');
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('User account is inactive');
    }

    return user.toJSON();
  },

  /**
   * Upgrade an existing customer to a seller account with an approved store profile.
   */
  applyForSeller: async (userId, { storeName, storeSlug, description = '', contactPhone = '' }) => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    if (user.role === 'seller' && user.sellerProfile) {
      throw ApiError.conflict('This user account already has an active seller profile');
    }

    const normalizedSlug = storeSlug.toLowerCase().trim();
    const existingStore = await Seller.findOne({ storeSlug: normalizedSlug });
    if (existingStore) {
      throw ApiError.conflict(`Store slug '${storeSlug}' is already taken`);
    }

    // Create seller document
    const seller = new Seller({
      user: user._id,
      storeName: storeName.trim(),
      storeSlug: normalizedSlug,
      description: description.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: user.email,
      status: 'approved'
    });
    await seller.save();

    user.role = 'seller';
    user.sellerProfile = seller._id;
    await user.save();

    // Reissue tokens with updated 'seller' role
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    const userJson = user.toJSON();
    userJson.sellerProfile = seller.toJSON();

    return {
      user: userJson,
      seller: seller.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }
};

export default authService;
