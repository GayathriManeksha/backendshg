const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

router.get('/dashboard/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Fetch the member's data based on the memberId
      const user = await User.findOne({id:userId}).populate('unit');
  
      if (!user) {
        return res.status(404).json({ message: 'Member not found' });
      }
  
     
      const unitName = user.unit.name;
      const memberName = user.name;
      
      res.json({ unitName, memberName });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  module.exports = router;