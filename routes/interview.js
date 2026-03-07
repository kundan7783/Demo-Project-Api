const express = require('express');
const myDB = require("../db");
const router = express.Router();

router.post('/add', async (req, res, next) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: "Name and Age are required"
      });
    }

    await myDB.query(
      'INSERT INTO interview (name, age) VALUES (?, ?)',
      [name, age]
    );

    res.status(201).json({
      success: true,
      message: "Add User Successfully...",
      data: {
        id: result.insertId,
        name,
        age
      }
    });

  } catch (error) {
    next(error);
  }
});

router.get('/get', async (req, res, next) => {
  try {

    const [rows] = await myDB.query('SELECT * FROM interview');

   res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: rows
    });

  } catch (error) {
    next(error);
  }
});

router.put('/update/:id', async (req, res, next) => {
  try {

    const { name, age } = req.body;
    const { id } = req.params;

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: "Name and Age are required"
      });
    }

    const [result] = await myDB.query(
      'UPDATE interview SET name = ?, age = ? WHERE id = ?',
      [name, age, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Update User Successfully...",
       data: {
        id,
        name,
        age
      }

    });

  } catch (error) {
    next(error);
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {

    const { id } = req.params;

    const [result] = await myDB.query(
      'DELETE FROM interview WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: 'Delete User Successfully...'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;