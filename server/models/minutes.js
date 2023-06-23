const mongoose = require('mongoose');

const minutesSchema = new mongoose.Schema({
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});



module.exports = minutesSchema;
