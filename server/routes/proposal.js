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

        // Find all proposal IDs the user has voted on
        const votedProposalIds = unit.voterecords
            .filter((vote) => vote.userId.toString() === user._id.toString())
            .map((vote) => vote.ProposalId.toString());

        console.log(votedProposalIds)

        // Find all proposals that the user has not voted on yet
        const proposals = unit.proposals.filter((proposal) => !votedProposalIds.includes(proposal._id.toString()));
        const filteredProposals = proposals.map((proposal) => ({
            description: proposal.description,
            _id: proposal._id,
        }));

        res.json(filteredProposals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for creating a new proposal
router.post('/createproposals', async (req, res) => {
    try {
        const { userId, name, amount, typeprop, propid } = req.body;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;
        // console.log(req.body);

        // const existingProposal = unit.proposals.find(proposal => proposal.toapprove.toString() === propid.toString())

        // if(existingProposal)
        // {
        //     return res.status(400).json({error:"Proposal already created"})
        // }
        // Create a new proposal
        const proposal = {
            description,
            votes: 0,
            totalVotes: 0,
            approved: false,
            typeproposal: typeprop,
            toapprove: propid,
            datecreated: new Date(),
        };
        // Save the proposal to the database
        unit.proposals.push(proposal);
        await unit.save();

        res.status(201).json(proposal);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for voting on a proposal
router.post('/proposals/vote', async (req, res) => {
    try {
        const { id, userId, vote } = req.body;
        console.log({ userId, vote, id })

        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }

        console.log(id)
        // Check if the user has already voted for this proposal
        const existingVote = await unit.voterecords.find(vote => vote.ProposalId.toString() === id.toString() &&
            vote.userId.toString() === user._id.toString()
        );
        console.log(existingVote)

        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted for this proposal.' });
        }

        // Increment the votes for the proposal
        await Unit.updateOne(
            { _id: unit._id, 'proposals._id': id },
            { $inc: { 'proposals.$.totalVotes': 1 } }
        );
        if (vote === 1) {
            console.log("Voted yaay");
            await Unit.updateOne(
                { _id: unit._id, 'proposals._id': id },
                { $inc: { 'proposals.$.votes': 1 } }
            );
            console.log("Voted yaayyy");
        }

        // Create a new vote record
        const voteR = { //1,0,-1
            userId: user._id,
            ProposalId: id,
            poll: vote,
        };
        unit.voterecords.push(voteR);

        //Checking if the proposal is approved
        // Get the proposal by its ID
        const proposal = unit.proposals.find((p) => p._id.toString() === id.toString());
        console.log(proposal)

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found.' });
        }

        // Check if the proposal has already been approved
        if (proposal.approved) {
            res.status(400).json({ error: 'The proposal has already been approved.' });
        }
        else {// Get the total number of votes for the proposal
            // const totalVotes = await Voterecord.countDocuments({ proposalId: id });
            const totalVotes = unit.members.length;

            // Calculate the majority threshold (e.g., 50% + 1 vote)
            const majorityThreshold = Math.ceil(totalVotes / 2);

            // Check if the proposal has received the majority of votes
            if (proposal.votes >= majorityThreshold) {
                // Update the proposal as approved
                await Unit.updateOne(
                    { _id: unit._id, 'proposals._id': id },
                    { $set: { 'proposals.$.approved': true } }
                );

                // Perform other actions if needed

                if (proposal.typeproposal === "Payment") {
                    console.log(proposal.toapprove.toString())
                    console.log("you")
                    const approved_payment = unit.payments.find((p) => p._id.toString() === proposal.toapprove.toString());
                    console.log(approved_payment)
                    await Unit.updateOne(
                        { _id: unit._id, 'payments._id': approved_payment._id },
                        { $set: { 'payments.$.approved': true } }
                    );
                }

                res.status(200).json({ message: 'Proposal approved and recorded successfully.' });
            } else {
                res.status(200).json({ message: 'Proposal did not receive the required majority of votes.' });
            }
        }
        // Save the vote record to the database
        await unit.save();

        return res.status(200).json({ message: 'Vote recorded successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint for calculating the winner and recording the result
router.post('/proposals/record', async (req, res) => {
    try {
        const { id, userId } = req.body;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        // Get the proposal by its ID
        const proposal = unit.proposals.find((p) => p._id.toString() === id.toString());
        console.log(proposal)

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found.' });
        }

        // Check if the proposal has already been approved
        if (proposal.approved) {
            return res.status(400).json({ error: 'The proposal has already been approved.' });
        }

        // Get the total number of votes for the proposal
        // const totalVotes = await Voterecord.countDocuments({ proposalId: id });
        const totalVotes = unit.members.length;

        // Calculate the majority threshold (e.g., 50% + 1 vote)
        const majorityThreshold = Math.ceil(totalVotes / 2);

        // Check if the proposal has received the majority of votes
        if (proposal.votes >= majorityThreshold) {
            // Update the proposal as approved
            await Unit.updateOne(
                { _id: unit._id, 'proposals._id': id },
                { $set: { 'proposals.$.approved': true } }
            );

            // Perform other actions if needed

            if (proposal.typeproposal === "Payment") {
                console.log(proposal.toapprove.toString())
                console.log("you")
                const approved_payment = unit.payments.find((p) => p._id.toString() === proposal.toapprove.toString());
                console.log(approved_payment)
                await Unit.updateOne(
                    { _id: unit._id, 'payments._id': approved_payment._id },
                    { $set: { 'payments.$.approved': true } }
                );
            }

            res.status(200).json({ message: 'Proposal approved and recorded successfully.' });
        } else {
            res.status(200).json({ message: 'Proposal did not receive the required majority of votes.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/proposals/disapproved', async (req, res) => {
    try {
        const userId = req.body.userID;
        const user = await User.findOne({ id: userId }).populate('unit');
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        const unit = user.unit;

        const totalVotes = unit.members.length;

        // Calculate the majority threshold (e.g., 50% + 1 vote)
        const majorityThreshold = Math.ceil(totalVotes / 2);
        console.log(unit.proposals)
        const disproposal = unit.proposals.filter(p => p.approved === false && p.totalVotes - p.votes >= majorityThreshold);
        // Check if the proposal has received the majority of votes
        console.log(disproposal);
        res.json(disproposal)
    }
    catch (error) {
        res.json({ error: "Error" });
    }
});

router.post('/deleteproposal', async (req, res) => {
    try {
        // Find the user and populate the 'unit' field
        const userId = req.body.userId;
        // const description = req.body.description;
        const proposalId = req.body.proposalId;
        const user = await User.findOne({ id: userId }).populate('unit');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the unit associated with the user
        const unit = user.unit;

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found or user is not the admin' });
        }

        // Find the proposal within the unit and update/delete it
        const proposalIndex = unit.proposals.findIndex((proposal) => proposal._id.toString() === proposalId.toString());

        if (proposalIndex === -1) {
            return res.status(404).json({ message: 'Proposal not found' });
        }
        const newProposal = {
            description: unit.proposals[proposalIndex].description,
            votes: 0,
            totalVotes: 0,
            approved: false,
            typeproposal: unit.proposals[proposalIndex].typeproposal,
            toapprove: unit.proposals[proposalIndex].toapprove,
            datecreated: new Date(),
        };
        unit.proposals.splice(proposalIndex, 1);
        unit.proposals.push(newProposal);

        // Save the updated unit
        await unit.save();

        res.status(200).json({ message: 'Proposal updated/deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
});

module.exports = router
