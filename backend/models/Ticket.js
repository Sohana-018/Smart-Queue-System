const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketNumber: { type: Number, required: true, unique: true },
    customerName: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Waiting', 'Serving', 'Resolved', 'Dropped'], 
        default: 'Waiting' 
    },
    joinTime: { type: Date, default: Date.now },
    serveTime: { type: Date },
    resolveTime: { type: Date }
});

module.exports = mongoose.model('Ticket', ticketSchema);