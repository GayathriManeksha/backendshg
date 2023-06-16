const express = require('express');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()

//since import is used add .js extension as well
const userRouter=require('./routes/users')
const attendanceRouter=require('./routes/attendance')
const unitRouter=require('./routes/units')
const loginRouter=require('./routes/login')
const proposalRouter=require('./routes/proposal')

const cors = require("cors");
app.use(express.json());
app.use(cors());

app.use("/", userRouter);
app.use("/", attendanceRouter);
app.use("/", unitRouter)
app.use("/", loginRouter)
app.use("/",proposalRouter)

mongoose.connect(process.env.url);

app.listen(3005, () => {
    console.log('Server started on port 3005');
});