const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    debugMode: {
        type: Boolean,
        default: false
    },
    botConfig: {
        greeting: {
            type: String,
            default: "Hello! I am your public health assistant. How can I help you today?"
        },
        fallback: {
            type: String,
            default: "I'm sorry, I don't have information on that yet. Please visit our website for more resources."
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
