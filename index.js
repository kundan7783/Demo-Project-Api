require('dotenv').config();
const express = require('express');

const app = express(); 
const authRouters = require('./routes/auth');
const userRouters = require('./routes/user');
const interviewRouterrs = require('./routes/interview');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json()); 


app.use('/api/auth', authRouters);
app.use('/api/user', userRouters);
app.use('/api/interview/',interviewRouterrs);

app.get('/', (req, res) => res.status(200).json({ message: "API Running....." }));

app.use(errorHandler);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running at port : ${PORT}`));
