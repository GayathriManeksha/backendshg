const express = require('express');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const app = express();

const SECRET_KEY = 'your_secret_key';

const bodyParser = require("body-parser");
app.use(express.json());
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const Unit = require('./models/unit');
const User = require('./models/user');
// const Announcement = require('./models/announcement');


mongoose.connect("mongodb://127.0.0.1:27017/shgdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
},);

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach the decoded token to the request object for future use
    req.user = decoded;
    next();
  });
};

// Define the API endpoint for creating a unit
app.post('/createunit', async (req, res) => {
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

app.post('/login', async (req, res) => {
  const { name, id } = req.body;

  console.log('Received request:', name, id);

  const user = await User.findOne({ name: name, id: id });
  if (user) {
    console.log(user);
    // Generate JWT token
    const token = jwt.sign({ name, id }, SECRET_KEY, { expiresIn: '1h' });
    console.log(token)
    return res.json({ status: true, token: token });

  }
  else {
    console.log("user not found");
    return res.json({ status: false, token: "" });
  }

});

app.get('/announcements', async (req, res) => {
  const { unitName } = req.query;

  try {
    // Find the unit by its name
    const unit = await Unit.findOne({ name: unitName });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Retrieve the announcements for the unit
    const announcements = unit.announcements;

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Error fetching announcements' });
  }
});



app.post('/announcements', async (req, res) => {
  const { unitName, senderId, message } = req.body;

  try {
    // Find the unit by its name
    const unit = await Unit.findOne({ name: unitName });

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Create a new announcement
    const newAnnouncement = {
      senderId,
      message,
    };

    // Add the announcement to the unit's announcements array
    unit.announcements.push(newAnnouncement);

    // Save the updated unit document
    await unit.save();

    res.status(201).json({ message: 'Announcement created successfully' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});


// API endpoint for creating a user
app.post('/users', async (req, res) => {

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

app.get('/attendance/:userId/:date', async (req, res) => {
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

    if (!attendanceEntry) {
      return res.json({ status: false, error: 'Attendance data not found for the specified date' });
    }

   const Allusers= await User.find({unit:user.unit._id});
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


app.post('/attendance', async (req, res) => {
  try {
    const unitId = req.body.unitId;
    const unit = await Unit.findById(unitId);
    const presentUserIds = req.body.presentUserIds;
    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date with no time component

    console.log(unit);
    if (unit.attendance === null) {
      unit.attendance = [];
    }

    const existingAttendance = unit.attendance.find((attendance) => {
      const attendanceDate = new Date(attendance.date).toISOString().split('T')[0];
      return attendanceDate === currentDate;
    });

    if (existingAttendance) {
      // Remove absent users from the existing attendance record
      existingAttendance.users = existingAttendance.users.filter((userId) =>
        presentUserIds.includes(userId)
      );

      // Add present users to the attendance record
      existingAttendance.users.push(...presentUserIds);

      // Save the updated attendance record
      unit.save()
        .then((updatedUnit) => {
          console.log('Attendance record updated:', updatedUnit.attendance);
          res.status(200).json({ message: 'Attendance updated successfully.' });
        })
        .catch((error) => {
          console.error('Error updating attendance record:', error);
          res.status(500).json({ error: 'Error updating attendance record.' });
        });
    } else {
      // Create a new attendance record for the present date
      const newAttendance = {
        date: currentDate,
        presentUsers: presentUserIds,
      };

      unit.attendance.push(newAttendance);

      // Save the updated unit document
      unit.save()
        .then((updatedUnit) => {
          console.log('Attendance record saved:', updatedUnit.attendance);
          res.status(200).json({ message: 'Attendance saved successfully.' });
        })
        .catch((error) => {
          console.error('Error saving attendance record:', error);
          res.status(500).json({ error: 'Error saving attendance record.' });
        });
    }
  } catch (error) {
    console.error('Error finding attendance record:', error);
    res.status(500).json({ error: 'Error finding attendance record.' });
  }
});


app.get('/users/:userId/invited', async (req, res) => {
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
// POST /units/:unitId/members
app.post('/units/:unitId/members', async (req, res) => {
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

// Example endpoint to check if the admin attribute ID matches user ID
app.get('/users/:id/hasAdminAccess', async (req, res) => {
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

app.listen(3005, () => {
  console.log('Server started on port 3005');
});










