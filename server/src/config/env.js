import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart',
  jwt: {
    secret: process.env.JWT_SECRET || 'novamart_default_dev_secret_replace_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'novamart_default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder_secret'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'novamart-cloud',
    apiKey: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret'
  }
};

export default config;
