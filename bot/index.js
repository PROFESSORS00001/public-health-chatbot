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
    res.send('Public Health Chatbot Backend is Running! (In-Memory Mode)');
});

// Load Knowledge Base
let knowledge = [];
try {
    knowledge = JSON.parse(fs.readFileSync('./knowledge.json', 'utf8'));
} catch (e) {
    console.log("Could not load knowledge.json, starting empty.");
}

// Analytics Data (Mock)
let analytics = {
    totalMessages: 5678,
    activeUsers: 123,
    verifiedStamps: 892
};

// Bot Configuration (Mock)
let botConfig = {
    greeting: "Hello! I am your public health assistant. How can I help you today?",
    fallback: "I'm sorry, I don't have information on that yet. Please visit our website for more resources."
};

// System Settings (Mock)
let systemSettings = {
    maintenanceMode: false,
    debugMode: false
};

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

    // Fallback to keyword-based matching from knowledge.json
    const msg = userMessage.toLowerCase();
    for (const entry of knowledge) {
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

    return botConfig.fallback;
}

// Webhook for WhatsApp (Twilio format)
app.post('/whatsapp', async (req, res) => {
    console.log('🔔 Incoming WhatsApp payload →', req.body);
    const incomingMsg = req.body.Body || '';
    const sender = req.body.From || 'unknown';

    console.log(`Received message from ${sender}: ${incomingMsg}`);

    // Check Maintenance Mode
    if (systemSettings.maintenanceMode) {
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
    analytics.totalMessages++;
    io.emit('analytics_update', analytics);
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
app.post('/api/admin/settings', requireAuth, (req, res) => {
    systemSettings = { ...systemSettings, ...req.body };
    console.log('System settings updated:', systemSettings);
    res.json({ success: true, message: 'Settings updated successfully' });
});

// Get system settings
app.get('/api/admin/settings', requireAuth, (req, res) => {
    res.json(systemSettings);
});

// Get bot configuration
app.get('/api/admin/bot-config', requireAuth, (req, res) => {
    res.json(botConfig);
});

// Update bot configuration
app.post('/api/admin/bot-config', requireAuth, (req, res) => {
    botConfig = { ...botConfig, ...req.body };
    res.json({ success: true, message: 'Bot configuration updated' });
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
app.get('/api/admin/analytics', requireAuth, (req, res) => {
    res.json(analytics);
});

// Reset analytics
app.post('/api/admin/reset-analytics', requireAuth, (req, res) => {
    analytics = {
        totalMessages: 0,
        activeUsers: 0,
        verifiedStamps: 0
    };
    io.emit('analytics_update', analytics);
    res.json({ success: true, message: 'Analytics reset successfully' });
});

// Export FAQs
app.get('/api/admin/export-faqs', requireAuth, (req, res) => {
    res.json(knowledge);
});

// ===== CHAT ENDPOINTS =====

// API Endpoint for Chat Simulator
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    // Check Maintenance Mode
    if (systemSettings.maintenanceMode) {
        return res.json({
            response: "The bot is currently undergoing maintenance. Please try again later.",
            stamp: null,
            timestamp: new Date()
        });
    }

    const answer = await findAnswer(message);
    const stamp = generateStamp(answer);

    // Update analytics
    analytics.totalMessages++;
    io.emit('analytics_update', analytics);

    res.json({
        response: answer,
        stamp: stamp,
        timestamp: new Date()
    });
});

// API Endpoints for FAQs
app.get('/api/faqs', (req, res) => {
    try {
        console.log('Fetching FAQs...');
        if (!knowledge) {
            console.error('Knowledge base is undefined!');
            return res.status(500).json({ error: 'Knowledge base not initialized' });
        }
        res.json(knowledge);
    } catch (err) {
        console.error('Error in GET /api/faqs:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

app.post('/api/faqs', requireAuth, (req, res) => {
    const newFaq = req.body;
    if (!newFaq.id) newFaq.id = Date.now();

    // Check if update or new
    const index = knowledge.findIndex(k => k.id === newFaq.id);
    if (index !== -1) {
        knowledge[index] = newFaq;
    } else {
        knowledge.push(newFaq);
    }

    // Persist to file (Optional for MVP, but good for persistence)
    // fs.writeFileSync('./knowledge.json', JSON.stringify(knowledge, null, 2));

    res.json({ success: true, faq: newFaq });
});

app.delete('/api/faqs/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    const index = knowledge.findIndex(k => k.id === id);
    if (index !== -1) {
        knowledge.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "FAQ not found" });
    }
});

// API Endpoint for Verification
app.post('/api/verify', (req, res) => {
    const { stamp } = req.body;

    // Mock verification logic
    const isValid = stamp && stamp.startsWith('0x') && stamp.length > 10;

    if (isValid) {
        analytics.verifiedStamps++;
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
io.on('connection', (socket) => {
    console.log('A user connected to the dashboard');
    socket.emit('analytics_update', analytics);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chatbot server running on port ${PORT}`);
});
