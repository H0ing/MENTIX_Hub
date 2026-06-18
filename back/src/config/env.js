import 'dotenv/config';

const requiredVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER_USER',
  'DB_USER_PASS',
  'DB_DEV_USER',
  'DB_DEV_PASS',
  'DB_ROOT_USER',
  'DB_ROOT_PASS',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY'
];


for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const config = {
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    users: {
      user: {
        user: process.env.DB_USER_USER,
        password: process.env.DB_USER_PASS
      },
      dev: {
        user: process.env.DB_DEV_USER,
        password: process.env.DB_DEV_PASS
      },
      root: {
        user: process.env.DB_ROOT_USER,
        password: process.env.DB_ROOT_PASS
      }
    }
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY,
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
    path: process.env.UPLOAD_PATH || 'uploads'
  },
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000
};

export default config;