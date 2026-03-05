const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEONDB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // Get count
    try {
      const res = await pool.query('SELECT value FROM counter WHERE name = $1', ['main']);
      const value = res.rows[0]?.value ?? 0;
      return {
        statusCode: 200,
        body: JSON.stringify({ count: value })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      };
    }
  } else if (event.httpMethod === 'POST') {
    // Update count
    try {
      const { count } = JSON.parse(event.body);
      await pool.query('INSERT INTO counter (name, value) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET value = $2', ['main', count]);
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      };
    }
  } else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }
};
