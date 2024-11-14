// server.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour session expiration
  })
);

// Database setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "userdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(200).send("User registered successfully");
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).send(err);
      if (
        result.length &&
        (await bcrypt.compare(password, result[0].password))
      ) {
        req.session.user = result[0];
        console.log(req.session.user);
        res.status(200).send("Login successful");
      } else {
        res.status(401).send("Invalid credentials");
      }
    }
  );
});

// Check session
app.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.send({ isLoggedIn: true, user: req.session.user });
  } else {
    res.send({ isLoggedIn: false });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
