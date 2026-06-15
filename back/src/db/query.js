import { userDB, devDB, rootDB } from './pool.js';

export async function user(sql, params) {
  const [rows] = await userDB.execute(sql, params);
  return { rows };
}

export async function dev(sql, params) {
  const [rows] = await devDB.execute(sql, params);
  return { rows };
}

export async function root(sql, params) {
  const [rows] = await rootDB.execute(sql, params);
  return { rows };
}