const express = require('express');
const User = require('../models/user');
const paymentSchema = require('../models/payments');
const router = express.Router();

router.post('/makepayment', async (req, res) => {
    try {
        const userId = req.body.userID;
        const id = req.body.id;
        const amt = req.body.amt;

        const user = await User.findOne({ id: userId }).populate('unit')
        const user2 = await User.findOne({ id: id })
        if (!user) {
            return res.json({ status: false, error: 'User not found' });
        }
        if (!user2) {
            return res.json({ status: false, error: 'User paid not found' });
        }
        const unit = user.unit;
        if (!unit) {
            return res.status(404).json({ error: 'Unit not found' });
        }
        // console.log(unit)
        const existingTransaction = unit.payments.find(
            payment => payment.user.toString() === user2._id.toString() && payment.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
        );
        if (existingTransaction) {
            return res.status(400).json({ error: 'A similar transaction already exists' });
        }
        const newpayment = {
            user: user2._id,
            date: new Date().toISOString().split('T')[0],
            amount: amt,
        };

        unit.payments.push(newpayment);
        await unit.save();

        const paymentId = unit.payments[unit.payments.length - 1]._id;
        console.log("Saved successfully", paymentId)

        const desc = `${user2.name} paid ${amt}`;
        console.log(desc)

        const proposal = {
            description: desc,
            votes: 0,
            approved: false,
            typeproposal: 'Payment',
            toapprove: paymentId,
            datecreated: new Date(),
        };

        console.log(proposal)
        // Save the proposal to the database
        unit.proposals.push(proposal);
        await unit.save();

        res.status(201).json(proposal);
        // return res.json({ status: true, paymentId });
    }
    catch (error) {
        console.log("error")
        return res.json({ status: false });
    }
});

module.exports = router