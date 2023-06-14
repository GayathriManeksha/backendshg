const express=require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

router.get('/users/:userId/invited', async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)
        // Find the user by ID
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const invitedValue = user.isinvited;
        res.json({ is_invited: invitedValue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// Example endpoint to check if the admin attribute ID matches user ID
router.get('/users/:id/hasAdminAccess', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by ID and populate the unit field
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(user._id)
        if (!user.unit) {
            console.log("Unit not found")
            return res.json({ hasAdminAccess: false });
        }

        // Check if the admin attribute ID matches the user ID
        const hasAdminAccess = user.unit.admin.toString() === user._id.toString();
        console.log(hasAdminAccess)
        res.json({ hasAdminAccess });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router