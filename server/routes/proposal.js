const express = require('express')
const router = express.Router();
const Unit = require('../models/unit');
const User = require('../models/user');

//Endpoint for fetching all the proposals that are not approved yet
router.get('/proposals/:userID', async (req, res) => {
    try {
        const userId = req.params.userID;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        const proposals = unit.proposals;
        await proposals.find({ approved: false });
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//Proposals that are not voted by a user yet
router.get('/proposals/:userId/not-voted', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        // Find all proposal IDs the user has voted on // UserId is reference here
        const votedProposalIds = await unit.voterecords.find({ userId: userId }).distinct('ProposalId');

        // Find all proposals that the user has not voted on yet
        const proposals = await unit.proposals.find({ _id: { $nin: votedProposalIds } });

        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for creating a new proposal
router.post('/createproposals', async (req, res) => {
    try {
        const { userId, description, typeprop } = req.body;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;
        console.log(req.body);

        // Create a new proposal
        const proposal = new Proposal({
            description,
            votes: 0,
            approved: false,
            typeproposal: typeprop,
        });

        // Save the proposal to the database
        unit.proposals.push(proposal);
        await unit.save();

        // Send proposal notification to all users (you can use a notification service for this)
        // const users = await User.find(); // Assuming User model exists with appropriate fields
        // users.forEach(user => {
        //     sendNotification(user.email, 'New Proposal', 'A new proposal requires your vote.');
        // });

        res.status(201).json(proposal);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for voting on a proposal
router.post('/proposals/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, vote } = req.body;
        console.log({ userId, vote, id })

        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        // Check if the user has already voted for this proposal
        const existingVote = await unit.voterecords.findOne({ userId, ProposalId: id });

        if (existingVote) {
            res.status(400).json({ error: 'You have already voted for this proposal.' });
            return;
        }

        // Increment the votes for the proposal
        if (vote === 1) {
            console.log("Voted yaay");
            await unit.proposals.updateOne({ _id: id }, { $inc: { votes: 1 } });
        }

        // Create a new vote record
        const voteR = new Voterecord({ //1,0,-1
            userId,
            ProposalId: id,
            poll: vote,
        });
        unit.voterecords.push(voteR);
        // Save the vote record to the database
        await unit.save();

        res.status(200).json({ message: 'Vote recorded successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for calculating the winner and recording the result
router.post('/proposals/:id/record', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        // Get the proposal by its ID
        const proposal = await unit.proposals.findById(id);

        if (!proposal) {
            res.status(404).json({ error: 'Proposal not found.' });
            return;
        }

        // Check if the proposal has already been approved
        if (proposal.approved) {
            res.status(400).json({ error: 'The proposal has already been approved.' });
            return;
        }

        // Get the total number of votes for the proposal
        // const totalVotes = await Voterecord.countDocuments({ proposalId: id });
        const totalVotes = await User.countDocuments();

        // Calculate the majority threshold (e.g., 50% + 1 vote)
        const majorityThreshold = Math.ceil(totalVotes / 2);

        // Check if the proposal has received the majority of votes
        if (proposal.votes >= majorityThreshold) {
            // Update the proposal as approved
            await unit.proposals.updateOne({ _id: id }, { $set: { approved: true } });

            // Perform other actions if needed

            res.status(200).json({ message: 'Proposal approved and recorded successfully.' });
        } else {
            res.status(200).json({ message: 'Proposal did not receive the required majority of votes.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports=router
