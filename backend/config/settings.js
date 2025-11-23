import 'dotenv/config.js';

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notehive';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
export const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '30d';

export const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
export const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
export const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
export const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 10 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'];

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

export const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000;
export const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || 100;
