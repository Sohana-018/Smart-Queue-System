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
    customerName: { type: String, default: "Customer" },
    status: { type: String, default: 'Waiting' },
    joinedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});
const Ticket = mongoose.model('Ticket', ticketSchema);

// --- SEEDER ROUTE (RUN THIS ONCE) ---
app.get('/api/seed', async (req, res) => {
    try {
        // WIPE THE SLATE CLEAN
        await mongoose.connection.db.dropCollection('tickets').catch(e => console.log("Collection not found, skipping drop."));

        const seedData = [];
        for (let i = 1; i <= 8; i++) {
            const joinTime = new Date();
            joinTime.setMinutes(joinTime.getMinutes() - (i * 8)); // Random past join times
            
            const completeTime = new Date();
            completeTime.setMinutes(completeTime.getMinutes() - (i * 3)); // Random past complete times

            seedData.push({
                ticketNumber: i,
                status: 'Completed',
                joinedAt: joinTime,
                completedAt: completeTime
            });
        }

        await Ticket.insertMany(seedData);
        res.send("<h1>Database Reset & Seeded!</h1><p>The old tickets are gone. Go check your dashboard.</p>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// --- CORE ROUTES ---
app.get('/api/news', (req, res) => {
    res.json(["Welcome to the Smart Queue System", "Real-time updates active"]);
});

app.post('/api/tickets', async (req, res) => {
    try {
        const count = await Ticket.countDocuments();
        const newTicket = new Ticket({ ticketNumber: count + 1 });
        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/tickets', async (req, res) => {
    const tickets = await Ticket.find().sort({ joinedAt: 1 });
    res.json(tickets);
});

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