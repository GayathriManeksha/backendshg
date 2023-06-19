const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');



// GET all announcements for a unit
// router.get('/:unitId/announcements', async (req, res) => {
    
//   try {
//     unitId=req.params.unitId;
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const unit = await Unit.findById(unitId).populate({
//       path: 'announcements.senderId',
//       match: { createdAt: { $gte: oneWeekAgo } } // Apply date filter
//     });


    
//     if (!unit) {
//       return res.status(404).json({ message: 'Unit not found' });
//     }

//     res.json(unit.announcements);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

//POST a new announcement for a unit
router.post('/announcements', async (req, res) => {
  try {
    
    const {unitId, senderId, message } = req.body;
    
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
router.get('/:unitId/announcements', async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // const unit = await Unit.findById(unitId).populate({
    //   path: 'announcements.senderId',
    //   select:'name',
    //   match: { createdAt: { $gte: oneWeekAgo } } // Apply date filter
    // }).populate('announcements.senderId'); // Populate senderId in the announcements
    const unit = await Unit.findById(unitId).populate({
      path: 'announcements.senderId',
      select: 'name',
      match: { createdAt: { $gte: oneWeekAgo } } // Apply date filter
    });
    

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const announcements = unit.announcements.map(announcement => ({
      //senderId: announcement.senderId,
      message: announcement.message,
      createdAt: announcement.createdAt
    }));

    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// router.get('/:unitId/announcements', async (req, res) => {
//   try {
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const unit = await Unit.findById(req.params.unitId).populate({
//       path: 'announcements.senderId',
//       match: { createdAt: { $gte: oneWeekAgo } }, // Apply date filter
//       select: 'name' // Specify the fields to select
//     });

//     if (!unit) {
//       return res.status(404).json({ message: 'Unit not found' });
//     }

//     // Extract the desired fields from the announcements
//     const announcements = unit.announcements.map(({ senderId, message, createdAt }) => ({
//       senderName: senderId.name,
//       message,
//       createdAt
//     }));

//     res.json(announcements);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
// router.get('/:unitId/announcements', async (req, res) => {
//   try {
//     const unitId = req.params.unitId;
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const unit = await Unit.findById(unitId).populate({
//       path: 'announcements.senderId',
//       select: 'name', // Select only the name field of senderId
//       match: { createdAt: { $gte: oneWeekAgo } } // Apply date filter
//     });

//     if (!unit) {
//       return res.status(404).json({ message: 'Unit not found' });
//     }

//     const announcements = unit.announcements.map(announcement => ({
//       senderName: announcement.senderId.name, // Use senderId.name as senderName
//       message: announcement.message,
//       createdAt: announcement.createdAt
//     }));

//     res.json(announcements);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });


module.exports = router;






