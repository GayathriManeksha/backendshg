const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

router.get('/attendance/:userId/:date', async (req, res) => {
    const userId = req.params.userId;
    const date = req.params.date;
    console.log(date)
    try {
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }

        const unit = user.unit;

        const attendanceEntry = unit.attendance.find((attendance) => {
            const attendanceDate = new Date(attendance.date).toISOString().split('T')[0]; // Convert attendance date to ISO 8601 format
            const targetDate = new Date(date).toISOString().split('T')[0]; // Convert target date to ISO 8601 format
            console.log(attendanceDate)
            console.log(targetDate)
            return attendanceDate === targetDate;
        });

        const Allusers = await User.find({ unit: user.unit._id });
        if (!attendanceEntry) {
            // Create an object for each present user with name, id, and flag representing presence
            const attendanceUsers = Allusers.map(user => ({
                name: user.name,
                id: user.id,
                present: 0,
            }));

            // Modify the attendanceEntry to include the present users with flags
            const attendanceEntryWithNamesAndIds = {
                date: date,
                presentUsers: attendanceUsers,
            };
            // return res.json({ status: false, error: 'Attendance data not found for the specified date' });
            return res.json(attendanceEntryWithNamesAndIds);
        }

        // Create an object for each present user with name, id, and flag representing presence
        const attendanceUsers = Allusers.map(user => ({
            name: user.name,
            id: user.id,
            present: attendanceEntry.users.includes(user._id) ? 1 : 0,
        }));

        // Modify the attendanceEntry to include the present users with flags
        const attendanceEntryWithNamesAndIds = {
            date: attendanceEntry.date,
            presentUsers: attendanceUsers,
        };

        res.json(attendanceEntryWithNamesAndIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/attendance', async (req, res) => {
    try {
        const userId = req.body.id;
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }

        const unit = user.unit;
        const currentDate = req.body.date; // Get the current date from the request body
        const presentUsers = req.body.presentUsers;

        console.log(unit);

        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        let existingAttendance = unit.attendance.find((attendance) => {
            const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
            return attendanceDate === currentDate;
        });

        // Create an object to store the updated attendance
        const updatedAttendance = {
            date: new Date(currentDate),
            users: []
        };

        // Iterate over the presentUsers array and update the attendance accordingly
        for (const user of presentUsers) {
            const { name, id, present } = user;

            // Find the user based on the provided ID
            const foundUser = await User.findOne({ id: id });

            if (!foundUser) {
                return res.status(404).json({ error: `User with ID ${id} not found` });
            }

            // If present is 1, add the user to the updatedAttendance
            if (present === 1) {
                updatedAttendance.users.push(foundUser._id);
            }
            // // If present is 0, remove the user from the updatedAttendance
            // else if (present === 0) {
            //   console.log(foundUser._id);
            //   updatedAttendance.users = updatedAttendance.users.filter(u => !u._id.equals(foundUser._id));
            // }
        }
        console.log(updatedAttendance)
        if (existingAttendance) {
            existingAttendance.users = updatedAttendance.users;
        }
        // Update the attendance array in the unit
        else { unit.attendance.push(updatedAttendance); }
        await unit.save();

        res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating attendance' });
    }
});

module.exports = router