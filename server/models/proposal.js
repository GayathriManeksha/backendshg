const mongoose = require('mongoose');


// Proposal schema
const proposalSchema = new mongoose.Schema({
    description: String,
    votes: Number,
    approved: Boolean,
    typeproposal: String,
    toapprove: mongoose.Schema.Types.ObjectId,
    datecreated:Date,
});

module.exports = proposalSchema;
