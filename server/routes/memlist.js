const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');



// Fetch and display members of the user's unit, including the user
router.post('/members', async (req, res) => {
  try {
    const userId = req.body.id; 

    // Fetch the user's unit
    const user = await User.findOne({id:userId}).populate('unit');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const unitId = user.unit;

    // Fetch the unit and populate the members field
    const unit = await Unit.findById(unitId).populate('members', 'name id');

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const members = unit.members.map(member => ({
      name: member.name,
      id: member.id,
    }));

    res.json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;