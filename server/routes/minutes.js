const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');


router.post('/minutes', async (req, res) => {
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

    const newMinute = {
      message
    };

    unit.minutes.push(newMinute);
    await unit.save();

    res.status(201).json({ message: 'Minutes created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/minutes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id }).populate('unit');


    const unitId = user.unit;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const unit = await Unit.findById(unitId).populate({
      path: 'minutes',
      match: { date: { $gte: threeDaysAgo } } // Apply date filter
    });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const minutes = unit.minutes.map(({ message, date }) => ({
      message,
       date: new Date(date).toISOString().split('T')[0]
    }))

    res.json(minutes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;
