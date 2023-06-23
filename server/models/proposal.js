const mongoose = require('mongoose');


// Proposal schema
const proposalSchema = new mongoose.Schema({
    description: { name: String, amount: String },
    votes: Number,
    totalVotes: Number,
    approved: Boolean,
    typeproposal: String,
    toapprove: mongoose.Schema.Types.ObjectId,
    datecreated: Date,
});

module.exports = proposalSchema;
