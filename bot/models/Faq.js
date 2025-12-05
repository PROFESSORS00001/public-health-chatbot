const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    keywords: {
        type: [String],
        default: []
    },
    resources: [{
        label: String,
        url: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Faq', FaqSchema);
