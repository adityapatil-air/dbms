// server.js
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');
const app     = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: 'root',
  database: 'electricity_billing'
});
db.connect(err => {
  if (err) console.error('DB connect error:', err);
  else console.log('Connected to MySQL!');
});

// POST /login → authenticates and returns userId (for Users) or role only (for Admin)
app.post('/login', (req, res) => {
  const { email, role } = req.body;
  if (role === 'Admin') {
    // Admin: no need to check email
    return res.json({ role: 'Admin' });
  }
  // User: look up by email
  db.query(
    'SELECT user_id FROM users WHERE email = ? AND role = "User"',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid user credentials' });
      return res.json({ role: 'User', userId: results[0].user_id });
    }
  );
});

// GET /dashboard?role=...&userId=...  → returns bills
app.get('/dashboard', (req, res) => {
  const { role, userId } = req.query;

  if (role === 'Admin') {
    // Admin sees all bills with user email
    const sql = `
      SELECT b.bill_id, b.units_consumed, b.bill_amount, b.due_date, b.status,
             u.email 
      FROM bills b
      JOIN meters m ON b.meter_id = m.meter_id
      JOIN users u  ON m.user_id = u.user_id
      ORDER BY b.due_date DESC
    `;
    db.query(sql, (err, bills) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ bills });
    });

  } else {
    // User sees only their bills
    const sql = `
      SELECT b.bill_id, b.units_consumed, b.bill_amount, b.due_date, b.status
      FROM bills b
      JOIN meters m ON b.meter_id = m.meter_id
      WHERE m.user_id = ?
      ORDER BY b.due_date DESC
    `;
    db.query(sql, [userId], (err, bills) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ bills });
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
