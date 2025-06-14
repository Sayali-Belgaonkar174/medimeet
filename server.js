const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
  secret: 'medi-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MySQL pool
async function db() {
  return mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Sdb@_17042004',
    database: 'medi_meet'
  });
}

// Middleware to ensure user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { role, name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const con = await db();
    await con.execute(`INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)`, [name, email, hashed, role]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { role, email, password } = req.body;
    const con = await db();
    const [rows] = await con.execute(`SELECT * FROM users WHERE email=? AND role=?`, [email, role]);
    if (!rows.length || !await bcrypt.compare(password, rows[0].password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.user = { id: rows[0].id, name: rows[0].name, role, email };
    res.json(req.session.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  });
});

// Nurse Route (Protected)
app.get('/api/nurse/tasks', requireLogin, async (req, res) => {
  try {
    const con = await db();
    const [rows] = await con.execute(`
      SELECT a.id, a.prescription, a.doctorName, a.date
      FROM appointments a
      WHERE a.doctorEmail IN (
        SELECT email FROM users WHERE role='doctor'
      )
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching nurse tasks' });
  }
});

// Superadmin - Get Users
app.get('/api/superadmin/users', requireLogin, async (req, res) => {
  try {
    const con = await db();
    const [rows] = await con.execute(`SELECT id,name,email,role FROM users`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Superadmin - Add User
app.post('/api/superadmin/users', requireLogin, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const con = await db();
    await con.execute(`INSERT INTO users (name,email,password,role) VALUES(?,?,?,?)`, [name, email, hashed, role]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'User creation failed' });
  }
});

// Superadmin - Delete User
app.delete('/api/superadmin/users/:id', requireLogin, async (req, res) => {
  try {
    const con = await db();
    await con.execute(`DELETE FROM users WHERE id=?`, [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'User deletion failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));