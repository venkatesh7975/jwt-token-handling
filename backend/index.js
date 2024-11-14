const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const JWT_SECRET = "your_jwt_secret"; // Replace with a secure secret in production

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
        // Generate JWT
        const token = jwt.sign(
          { id: result[0].id, username: result[0].username },
          JWT_SECRET,
          {
            expiresIn: "1m",
          }
        );
        res.status(200).json({ message: "Login successful", token });
      } else {
        res.status(401).send("Invalid credentials");
      }
    }
  );
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
};

// Check session (using JWT to verify if user is logged in)
app.get("/check-session", authenticateToken, (req, res) => {
  res.send({ isLoggedIn: true, user: req.user });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
