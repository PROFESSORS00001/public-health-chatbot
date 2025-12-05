require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { generateStamp } = require('./stamp');
const { getAIResponse } = require('./openai');
const { validateCredentials, createSession, validateSession, deleteSession, requireAuth, updatePassword } = require('./auth');
const connectDB = require('./db');
const Faq = require('./models/Faq');
const Analytics = require('./models/Analytics');
const Settings = require('./models/Settings');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://phchatbot.netlify.app", "http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: ["https://phchatbot.netlify.app", "http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Health Check Route
app.get('/', (req, res) => {
    const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    const dbStatus = states[mongoose.connection.readyState] || 'Unknown';
    res.send(`Public Health Chatbot Backend is Running! <br> DB Status: <strong>${dbStatus}</strong> (${mongoose.connection.readyState})`);
});

// Debug MongoDB URI (Masked)
if (process.env.MONGODB_URI) {
    console.log('MONGODB_URI is set:', process.env.MONGODB_URI.substring(0, 15) + '...');
} else {
    console.error('FATAL: MONGODB_URI is NOT set!');
}

// Seed Data Helper
const seedData = async () => {
    try {
        // Seed FAQs
        const faqCount = await Faq.countDocuments();
        if (faqCount === 0) {
            console.log('Seeding FAQs...');
            let knowledge = [];
            try {
                knowledge = JSON.parse(fs.readFileSync('./knowledge.json', 'utf8'));
            } catch (e) {
                console.log("Could not load knowledge.json for seeding.");
            }
            if (knowledge.length > 0) {
                await Faq.insertMany(knowledge);
                console.log('FAQs seeded.');
            }
        }

        // Seed Analytics
        const analyticsCount = await Analytics.countDocuments();
        if (analyticsCount === 0) {
            console.log('Seeding Analytics...');
            await Analytics.create({});
            console.log('Analytics seeded.');
        }

        // Seed Settings
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            console.log('Seeding Settings...');
            await Settings.create({});
            console.log('Settings seeded.');
        }
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};

// Run Seeder
seedData();

// Helper to find answer - AI-powered with keyword-based fallback
async function findAnswer(userMessage) {
    // OpenAI integration disabled – always use keyword fallback
    // if (process.env.OPENAI_API_KEY) {
    //     try {
    //         const aiResponse = await getAIResponse(userMessage);
    //         // Check if it's not an error fallback message
    //         if (!aiResponse.includes("currently having trouble")) {
    //             return aiResponse;
    //         }
    //         console.log("AI returned error message, falling back to keyword matching");
    //     } catch (error) {
    //         console.log("OpenAI failed, falling back to keyword matching:", error.message);
    //     }
    // }

    // Fallback to keyword-based matching from DB
    const msg = userMessage.toLowerCase();
    const faqs = await Faq.find({}); // In production, use text search index for efficiency

    for (const entry of faqs) {
        if (entry.keywords && entry.keywords.some(keyword => msg.includes(keyword.toLowerCase()))) {
            let response = entry.answer;
            if (entry.resources && entry.resources.length > 0) {
                response += "\n\n📚 *Related Resources:*";
                entry.resources.forEach(res => {
                    response += `\n• [${res.label}](${res.url})`;
                });
            }
            return response;
        }
    }

    // Get fallback message from DB
    const settings = await Settings.findOne();
    return settings?.botConfig?.fallback || "I'm sorry, I don't have information on that yet. Please visit our website for more resources.";
}

// Webhook for WhatsApp (Twilio format)
app.post('/whatsapp', async (req, res) => {
    console.log('🔔 Incoming WhatsApp payload →', req.body);
    const incomingMsg = req.body.Body || '';
    const sender = req.body.From || 'unknown';

    console.log(`Received message from ${sender}: ${incomingMsg}`);

    // Check Maintenance Mode
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
        res.set('Content-Type', 'text/xml');
        return res.send(`
            <Response>
                <Message>The bot is currently undergoing maintenance. Please try again later.</Message>
            </Response>
        `);
    }

    const answer = await findAnswer(incomingMsg);
    const stamp = generateStamp(answer);

    const finalResponse = `${answer}\n\n[Official Stamp: ${stamp}]`;

    // Update analytics and emit to frontend
    await Analytics.findOneAndUpdate({}, { $inc: { totalMessages: 1 } });
    const updatedAnalytics = await Analytics.findOne();

    io.emit('analytics_update', updatedAnalytics);
    io.emit('new_message', { text: incomingMsg, timestamp: new Date() });

    console.log(`Replying: ${finalResponse}`);

    // TwiML response
    res.set('Content-Type', 'text/xml');
    res.send(`
    <Response>
      <Message>${finalResponse}</Message>
    </Response>
  `);
});

// ===== AUTHENTICATION ENDPOINTS =====

// Admin login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (validateCredentials(username, password)) {
        const token = createSession();
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const isAuthenticated = validateSession(token);
    res.json({ authenticated: isAuthenticated });
});

// Admin logout
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        deleteSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

// ===== ADMIN SYSTEM ENDPOINTS =====

// Update system settings
app.post('/api/admin/settings', requireAuth, async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        console.log('System settings updated:', settings);
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get system settings
app.get('/api/admin/settings', requireAuth, async (req, res) => {
    const settings = await Settings.findOne();
    res.json(settings || {});
});

// Get bot configuration
app.get('/api/admin/bot-config', requireAuth, async (req, res) => {
    const settings = await Settings.findOne();
    res.json(settings?.botConfig || {});
});

// Update bot configuration
app.post('/api/admin/bot-config', requireAuth, async (req, res) => {
    try {
        await Settings.findOneAndUpdate({}, { botConfig: req.body }, { upsert: true });
        res.json({ success: true, message: 'Bot configuration updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update bot config' });
    }
});

// Change password
app.post('/api/admin/change-password', requireAuth, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    updatePassword(newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
});

// Export analytics data
app.get('/api/admin/analytics', requireAuth, async (req, res) => {
    const analytics = await Analytics.findOne();
    res.json(analytics || {});
});

// Reset analytics
app.post('/api/admin/reset-analytics', requireAuth, async (req, res) => {
    await Analytics.findOneAndUpdate({}, {
        totalMessages: 0,
        activeUsers: 0,
        verifiedStamps: 0
    });
    const analytics = await Analytics.findOne();
    io.emit('analytics_update', analytics);
    res.json({ success: true, message: 'Analytics reset successfully' });
});

// Export FAQs
app.get('/api/admin/export-faqs', requireAuth, async (req, res) => {
    const faqs = await Faq.find({});
    res.json(faqs);
});

// ===== CHAT ENDPOINTS =====

// API Endpoint for Chat Simulator
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    // Check Maintenance Mode
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
        return res.json({
            response: "The bot is currently undergoing maintenance. Please try again later.",
            stamp: null,
            timestamp: new Date()
        });
    }

    const answer = await findAnswer(message);
    const stamp = generateStamp(answer);

    // Update analytics
    await Analytics.findOneAndUpdate({}, { $inc: { totalMessages: 1 } });
    const analytics = await Analytics.findOne();
    io.emit('analytics_update', analytics);

    res.json({
        response: answer,
        stamp: stamp,
        timestamp: new Date()
    });
});

// API Endpoints for FAQs
app.get('/api/faqs', async (req, res) => {
    try {
        const faqs = await Faq.find({}).sort({ createdAt: -1 });
        res.json(faqs);
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).json({ error: "Failed to fetch FAQs", details: err.message });
    }
});

app.post('/api/faqs', requireAuth, async (req, res) => {
    const newFaq = req.body;

    try {
        let savedFaq;
        // Check if update or new (based on ID being present and existing in DB)
        const existing = await Faq.findOne({ id: newFaq.id });

        if (existing) {
            savedFaq = await Faq.findOneAndUpdate({ id: newFaq.id }, newFaq, { new: true });
        } else {
            if (!newFaq.id) newFaq.id = Date.now();
            savedFaq = await Faq.create(newFaq);
        }
        res.json({ success: true, faq: savedFaq });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save FAQ" });
    }
});

app.delete('/api/faqs/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await Faq.findOneAndDelete({ id: id });
        if (result) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "FAQ not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete FAQ" });
    }
});

// API Endpoint for Verification
app.post('/api/verify', async (req, res) => {
    const { stamp } = req.body;

    // Mock verification logic
    const isValid = stamp && stamp.startsWith('0x') && stamp.length > 10;

    if (isValid) {
        await Analytics.findOneAndUpdate({}, { $inc: { verifiedStamps: 1 } });
        const analytics = await Analytics.findOne();
        io.emit('analytics_update', analytics);

        res.json({
            isValid: true,
            timestamp: new Date().toLocaleString(),
            message: "This message is verified as official.",
            source: "Ministry of Health Bot",
            blockNumber: Math.floor(Math.random() * 1000000) + 5000000
        });
    } else {
        res.json({
            isValid: false,
            message: "Invalid stamp code. Please check and try again."
        });
    }
});

// Socket.io Connection
io.on('connection', async (socket) => {
    console.log('A user connected to the dashboard');
    const analytics = await Analytics.findOne();
    socket.emit('analytics_update', analytics || {});

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chatbot server running on port ${PORT}`);
});
