import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export async function signAccessToken(userId, role, version) {
  const payload = {
    userId,
    role,
    version,
    type: 'access'
  };
  
  const token = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry
  });
  
  return token;
}

export async function signRefreshToken(userId, version) {
  const payload = {
    userId,
    version,
    type: 'refresh'
  };
  
  const token = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry
  });
  
  return token;
}

export async function verifyAccessToken(token) {
  const decoded = jwt.verify(token, config.jwt.accessSecret);
  return decoded;
}

export async function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  return decoded;
}