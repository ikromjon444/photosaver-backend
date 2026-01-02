const express = require("express");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await pool.query(
    "SELECT id, username FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json(user.rows[0]);
});

module.exports = router;
