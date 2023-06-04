const mongoose = require('mongoose');


const announcementSchema = new mongoose.Schema({
  unit: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  senderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
