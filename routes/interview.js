const express = require('express');
const myDB = require("../db");
const router = express.Router();

router.post('/add',async(req,res,next)=>{
   try{
    const {name, age} = req.body;
    await myDB.query(
        'INSERT INTO interview (name, age) VALUES (?, ?)',
        [name,age]
    );
    res.status(201).json({
        message : "Add User Successfully..."
    });
   }catch(error){
    next(error);
   }
});
router.get('/get',async(req,res,next)=>{
    try{
    const [rows] = await myDB.query('SELECT * FROM interview');
    res.status(200).json(rows);
   }catch(error){
    next(error);
   }
});
router.put('/update/:id',async(req,res,next)=>{
    try{
    const {name, age} = req.body;
    const { id } = req.params;
    await myDB.query(
       'UPDATE interview SET name = ?, age = ? WHERE id = ?',
      [name, age, id]
    );
    res.status(200).json({
        message : "Update User Successfully..."
    });
   }catch(error){
    next(error);
   }
});
router.delete('/delete/:id',async(req,res,next)=>{
     try{
      const { id } = req.params;

    await myDB.query(
      'DELETE FROM interview WHERE id = ?',
      [id]
    );

    res.json({ message: 'delete User Successfully...' });
   }catch(error){
    next(error);
   }
});

module.exports = router;