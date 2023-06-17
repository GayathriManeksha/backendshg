const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');



// GET all announcements for a unit
router.get('/:unitId/announcements', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const unit = await Unit.findById(unitId).populate({
      path: 'announcements.senderId',
      match: { createdAt: { $gte: oneWeekAgo } } // Apply date filter
    });


    
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json(unit.announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST a new announcement for a unit
router.post('/:unitId/announcements', async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const { senderId, message } = req.body;

    const unit = await Unit.findById(unitId);

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const newAnnouncement = {
      senderId,
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

module.exports = router;






