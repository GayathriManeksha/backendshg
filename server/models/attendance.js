const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a 'User' collection with user information
        // required: true
    }],
    date: {
        type: Date,
        required: true
    }
});

// const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = attendanceSchema