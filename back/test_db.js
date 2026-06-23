import 'dotenv/config';
import mysql from 'mysql2/promise';

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 8889,
      user: 'mentix_dev',
      password: 'mentix_dev_pass_2024',
      database: 'mentix_hub'
    });
    
    try {
      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM users');
      console.log('Users SELECT OK:', rows);
    } catch(e) {
      console.log('Users SELECT error:', e.message);
    }
    
    try {
      const [tables] = await conn.execute("SELECT TABLE_NAME as name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", ['mentix_hub']);
      console.log('Tables:', tables.map(t => t.name));
    } catch(e) {
      console.log('information_schema query error:', e.message);
    }
    
    try {
      const [result] = await conn.execute("SELECT TABLE_NAME as name, TABLE_ROWS as rows, ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as size_mb, ENGINE as engine, TABLE_COLLATION as collation FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME", ['mentix_hub']);
      console.log('listTables result:', result.length, 'tables');
      console.log('First table:', result[0]);
    } catch(e) {
      console.log('listTables query error:', e.message);
    }
    
    await conn.end();
  } catch(e) {
    console.log('Connection error:', e.message);
  }
}

test();
