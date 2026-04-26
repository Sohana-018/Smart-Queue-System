const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB SCHEMA ---
const ticketSchema = new mongoose.Schema({
    ticketNumber: Number,
    customerName: String,
    status: { type: String, default: 'Waiting' },
    joinedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// --- ROUTES ---

// 1. Get Live News (For Ticker)
app.get('/api/news', (req, res) => {
    res.json([
        "🚀 Queue Automation System v2.0 is now live!",
        "🎮 Try the Snake Game while you wait for your turn.",
        "📊 Admin: Check the new Analytics Dashboard for wait times.",
        "💡 Pro Tip: Hover over news headlines to pause the scroll."
    ]);
});

// 2. Join Queue
app.post('/api/tickets', async (req, res) => {
    try {
        const count = await Ticket.countDocuments();
        const newTicket = new Ticket({
            ticketNumber: count + 1,
            customerName: req.body.customerName || "Guest"
        });
        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Get All Tickets
app.get('/api/tickets', async (req, res) => {
    const tickets = await Ticket.find().sort({ joinedAt: 1 });
    res.json(tickets);
});

// 4. Update Status (With Timestamp Tracking)
app.patch('/api/tickets/:id', async (req, res) => {
    const updateData = { status: req.body.status };
    if (req.body.status === 'Completed') {
        updateData.completedAt = new Date();
    }
    const updated = await Ticket.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
});

const PORT = 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB Connected!");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});