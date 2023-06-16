const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';


router.post('/login', async (req, res) => {
    const { name, id } = req.body;

    console.log('Received request:', name, id);

    const user = await User.findOne({ name: name, id: id });
    if (user) {
        console.log(user);
        // Generate JWT token
        const token = jwt.sign({ name, id }, SECRET_KEY, { expiresIn: '1h' });
        console.log(token)
        return res.json({ status: true, token: token });

    }
    else {
        console.log("user not found");
        return res.json({ status: false, token: "" });
    }

});

module.exports=router