const mongoose = require('mongoose');


const announcementSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

// const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = announcementSchema;
