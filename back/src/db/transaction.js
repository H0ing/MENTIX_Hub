import { userDB, devDB, rootDB } from './pool.js';

const pools = { user: userDB, dev: devDB, root: rootDB };

export async function transaction(callback, poolType = 'user') {
  const pool = pools[poolType];
  
  if (!pool) {
    throw new Error(`Invalid pool type: ${poolType}. Use 'user', 'dev', or 'root'`);
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}