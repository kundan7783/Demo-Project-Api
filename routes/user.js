const express = require("express");
const verifyToken = require("../middleware/authHandler");
const myDB = require("../db");
const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const authId = req.user.id;

    const [authRow] = await myDB.query(
      "SELECT user_id FROM auth WHERE id = ?",
      [authId]
    );

    if (authRow.length === 0) {
      return res.status(404).json({ message: "Auth not found" });
    }

    if (authRow[0].user_id) {
      return res.status(400).json({
        message: "User profile already exists"
      });
    }

    const [userResult] = await myDB.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    const userId = userResult.insertId;

    await myDB.query(
      "UPDATE auth SET user_id = ? WHERE id = ?",
      [userId, authId]
    );

    res.json({
      message: "User profile created successfully",
      user_id: userId
    });

  } catch (error) {
    next(error);
  }
});

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const authId = req.user.id;

    const [authRow] = await myDB.query(
      "SELECT user_id FROM auth WHERE id = ?",
      [authId]
    );

    if (authRow.length === 0) {
      return res.status(404).json({
        message: "Auth not found"
      });
    }

    // ❌ Profile not created
    if (!authRow[0].user_id) {
      return res.json({
        profileExists: false,
        message: "User profile not created"
      });
    }

    // ✅ Profile exists
    const [userRows] = await myDB.query(
      "SELECT name, email FROM users WHERE id = ?",
      [authRow[0].user_id]
    );

    res.json({
      profileExists: true,
      name: userRows[0].name,
      email: userRows[0].email
    });

  } catch (error) {
    next(error);
  }
});


router.put('/', verifyToken, async (req, res, next) => {
  try {
    const authId = req.user.id;
    const { name, email } = req.body;

    const [authRow] = await myDB.query(
      "SELECT user_id FROM auth WHERE id = ?",
      [authId]
    );

    if (authRow.length === 0 || !authRow[0].user_id) {
      return res.status(404).json({
        message: "User profile not found"
      });
    }

    await myDB.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, authRow[0].user_id]
    );

    res.json({
      message: "Profile updated successfully"
    });

  } catch (error) {
    next(error);
  }
});


module.exports = router;
