const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Date,
        required: true
    },
    approved: {
        type: Boolean,
        default: false,
    }
})