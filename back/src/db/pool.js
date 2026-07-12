import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const caCert = fs.readFileSync(path.join(__dirname, '..', '..', 'ca.pem'));

const baseConfig = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  ssl: { ca: caCert, rejectUnauthorized: true },
  timezone: '+00:00',
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

const userDB = mysql.createPool({
  ...baseConfig,
  user: config.db.users.user.user,
  password: config.db.users.user.password,
  connectionLimit: 15
});

const devDB = mysql.createPool({
  ...baseConfig,
  user: config.db.users.dev.user,
  password: config.db.users.dev.password,
  connectionLimit: 5,
  multipleStatements: true
});

const rootDB = mysql.createPool({
  ...baseConfig,
  user: config.db.users.root.user,
  password: config.db.users.root.password,
  connectionLimit: 3,
  multipleStatements: true
});

export { userDB, devDB, rootDB };