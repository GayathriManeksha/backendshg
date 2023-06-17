const mongoose = require('mongoose')

const VoterecordSchema = new mongoose.Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    ProposalId: { type: mongoose.SchemaTypes.ObjectId, ref: "Proposal" },
    poll: Number
})

// const Voterecord = mongoose.model('Voterecord', VoterecordSchema);
module.exports=VoterecordSchema