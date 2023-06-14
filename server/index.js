const express = require('express');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const app = express();

//since import is used add .js extension as well
const userRouter=require('./routes/users')
const attendanceRouter=require('./routes/attendance')
const unitRouter=require('./routes/units')
const loginRouter=require('./routes/login')

const cors = require("cors");
app.use(express.json());
app.use(cors());

app.use("/users", userRouter);
app.use("/attendance", attendanceRouter);
app.use("/units", unitRouter)
app.use("/auth", loginRouter)

mongoose.connect("mongodb://127.0.0.1:27017/shgdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
},);

app.listen(3005, () => {
    console.log('Server started on port 3005');
});