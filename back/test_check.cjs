const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({
    host:'localhost',port:8889,user:'mentix_dev',password:'mentix_dev_pass_2024',database:'mentix_hub'
  });
  const [r] = await c.execute("SELECT role, COUNT(*) as cnt FROM users GROUP BY role ORDER BY role");
  console.log('Users by role:', JSON.stringify(r, null, 2));
  await c.end();
})();
