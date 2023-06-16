const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
    },
    amount: {
        type: Number,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    }
})

module.exports = paymentSchema