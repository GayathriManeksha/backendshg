const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');
const mongoose = require('mongoose');



router.post('/announcements', async (req, res) => {
  try {
    const { id, message } = req.body;
    

    const user = await User.findOne({ id}).populate('unit');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const unit = user.unit; // Retrieve the unitId from the user

    // const unit = await Unit.findById(unitId);

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    console.log(user._id);

    const newAnnouncement = {
      senderId: user._id,
      message
    };

    unit.announcements.push(newAnnouncement);
    await unit.save();

    res.status(201).json({ message: 'Announcement created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/announcements/:id', async (req, res) => {
  try {
    //const { uid } = req.params.id;
    const { id } = req.params;
    const uid = id;

    console.log(uid)
    const user = await User.findOne({ id: uid }).populate('unit');
    
    console.log(user)
    const unitId = user.unit;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    
    const unit = await Unit.findById(unitId).populate({
  
      path: 'announcements',
      populate: {
        path: 'senderId',
        select: 'name'
      },
    });
    

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

   
    const announcements = unit.announcements.map(({ senderId, message, createdAt }) => {
      const senderName = senderId.name; // Retrieve the sender's name
      return { senderName, message, createdAt };
    });

    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;






