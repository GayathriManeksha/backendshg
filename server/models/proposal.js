const mongoose = require('mongoose');


// Proposal schema
const proposalSchema = new mongoose.Schema({
    description: String,
    votes: Number,
    approved: Boolean,
    typeproposal: String,
});

module.exports = proposalSchema;
