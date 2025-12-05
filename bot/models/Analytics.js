const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    totalMessages: {
        type: Number,
        default: 0
    },
    activeUsers: {
        type: Number,
        default: 0
    },
    verifiedStamps: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
