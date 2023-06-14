const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

// POST /units/:unitId/members
router.post('/createunit', async (req, res) => {
    try {
        const unitName = req.body.unit_name;
        const userId = req.body.uid;

        // Find the user by ID
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set isinvited to 1 for the user
        user.isinvited = 2;
        await user.save();

        // Create the unit and assign the user as a member and admin
        const unit = new Unit({ name: unitName, admin: user._id });
        unit.members.push(user._id);
        unit.no_of_members = 1;

        await unit.save();
        user.unit = unit._id;
        await user.save();
        return res.json({ status: true });
    } catch (error) {
        console.error(error);
        return res.json({ status: false });
    }
});
router.post('/units/:unitId/members', async (req, res) => {
    try {
        const unitId = req.params.unitId;
        const memberId = req.body.memberId;

        // Find the unit by ID
        const unit = await Unit.findById(unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        // Find the user by ID
        const user = await User.findById(memberId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is already a member of the unit
        if (unit.members.includes(memberId)) {
            return res.status(400).json({ message: 'User is already a member of the unit' });
        }

        // Add the member to the unit
        unit.members.push(memberId);
        unit.no_of_members += 1;

        // Save the updated unit
        await unit.save();

        res.status(200).json({ message: 'Member added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router