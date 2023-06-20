const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

router.post('/users', async (req, res) => {

    console.log("Hey")
    const { name, id } = req.body;

    try {
        // Create a new user
        const user = new User({ name, id });

        // Save the user to the database
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

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

router.post('/addusers', async (req, res) => {

    const userId = req.body.userId;
    const idtoadd = req.body.id;

    try {
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(user._id)
        if (!user.unit) {
            console.log("Unit not found")
            return res.json({ error: "Unit not found" });
        }

        const hasAdminAccess = user.unit.admin.toString() === user._id.toString();
        if (!hasAdminAccess) {
            console.log("error Not admin")
            return res.json({ error: "not admin to add" })
        }

        const existingUser = await User.findOne({ id: idtoadd });

        if (existingUser) {
            existingUser.unit = user.unit._id;
            existingUser.isinvited = 1;
            await existingUser.save();
            return res.json({ message: 'User invited' });
        }
        else {
            return res.json({ error: "User does not exist" })
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
})

router.get('/invitedunits/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isinvited === 0) {
            return res.json({ error: 'User is not invited to any unit' });
        }
        else if (user.isinvited === 2) {
            return res.json({ error: 'User already in a unit' });
        }

        const unitId = user.unit._id;
        const unitName = user.unit.name;

        console.log({ unitId, unitName });
        return res.json({ unitId, unitName });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.post('/joinunit', async (req, res) => {

    const { unitId, userId } = req.body;

    try {
        const unit = await Unit.findById(unitId);

        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.isinvited === 2) {
            return res.json({ error: 'User already in a unit' });
        }

        if (user.unit.toString() !== unit._id.toString()) {
            console.log(user.unit)
            console.log(unit._id)
            console.log("error in channel joined and invited");
            return res.json({ error: "Mismatch in unit joined and invited" })
        }
        user.isinvited = 2;
        user.save();

        //check if the same user is in the channel
        unit.members.push(user._id);
        unit.no_of_members = unit.members.length;
        unit.save();

        return res.json({ message: 'User joined the unit successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router