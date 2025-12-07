require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { generateStamp } = require('./stamp');
const { getAIResponse } = require('./openai');
const { validateCredentials, createSession, validateSession, deleteSession, requireAuth, changeAdminPassword } = require('./auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for MVP
        methods: ["GET", "POST"]
    }
});

const allowedOrigins = [
    "https://ubmed.netlify.app",
    "https://public-health-chatbot.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ===== PERSISTENCE HELPERS =====
const DATA_FILES = {
    knowledge: './knowledge.json',
    config: './config.json',
    news: './news.json',
    subscribers: './subscribers.json',
    pages: './pages.json'
};

function loadData(file, defaultData) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
    }
    return defaultData;
}

function saveData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error saving ${file}:`, e);
    }
}

// Load Data
let knowledge = loadData(DATA_FILES.knowledge, []);
let botConfig = loadData(DATA_FILES.config, {
    greeting: "Hello! I am your public health assistant. How can I help you today?",
    fallback: "I'm sorry, I don't have information on that yet. Please visit our website for more resources."
});
let news = loadData(DATA_FILES.news, []); // Array of { id, title, content, date }
let subscribers = loadData(DATA_FILES.subscribers, []); // Array of phone numbers
let pages = loadData(DATA_FILES.pages, {}); // Dictionary of page slug -> { title, content }

// Analytics Data (Mock)
let analytics = {
    totalMessages: 5678,
    activeUsers: 123,
    verifiedStamps: 892
};

// ===== BOT LOGIC =====

// Helper to find answer
async function findAnswer(userMessage) {
    const msg = userMessage.toLowerCase();

    // 1. Check for News/Updates keywords
    if (msg.includes('news') || msg.includes('update') || msg.includes('latest')) {
        if (news.length > 0) {
            // Get latest 3 items
            const latestNews = news.slice(-3).reverse();
            let response = "📢 *Latest Health Updates*:\n\n";
            latestNews.forEach(item => {
                response += `📌 *${item.title}* (${new Date(item.date).toLocaleDateString()})\n${item.content}\n\n`;
            });
            return response.trim();
        } else {
            return "There are no new health updates at the moment. Please check back later.";
        }
    }

    // 2. Check for Keyword Matches (Local Knowledge Base)
    for (const entry of knowledge) {
        if (entry.keywords && entry.keywords.some(keyword => msg.includes(keyword.toLowerCase()))) {
            let answer = entry.answer;
            if (entry.links && entry.links.length > 0) {
                answer += "\n\n*Related Resources:*";
                entry.links.forEach(link => {
                    answer += `\n- [${link.title}](${link.url})`;
                });
            }
            return answer;
        }
    }

    // 3. AI-Powered Fallback (Fact Checking & General Info)
    if (process.env.OPENAI_API_KEY) {
        try {
            const aiResponse = await getAIResponse(userMessage);
            if (!aiResponse.includes("currently having trouble")) {
                return aiResponse;
            }
        } catch (error) {
            console.log("OpenAI failed:", error.message);
        }
    }

    // 4. Final Fallback
    return botConfig.fallback;
}

// WhatsApp Webhook
app.post('/whatsapp', async (req, res) => {
    const incomingMsg = req.body.Body || '';
    const sender = req.body.From;

    console.log(`Received message from ${sender}: ${incomingMsg}`);

    // Handle Subscriptions
    if (incomingMsg.toLowerCase().includes('subscribe')) {
        if (!subscribers.includes(sender)) {
            subscribers.push(sender);
            saveData(DATA_FILES.subscribers, subscribers);
            res.set('Content-Type', 'text/xml');
            return res.send(`<Response><Message>✅ You have been subscribed to public health updates.</Message></Response>`);
        } else {
            res.set('Content-Type', 'text/xml');
            return res.send(`<Response><Message>You are already subscribed.</Message></Response>`);
        }
    }

    const answer = await findAnswer(incomingMsg);
    const stamp = generateStamp(answer);
    let finalResponse = `${answer}`;

    // Only add stamp if it's a "verified" answer (from KB or AI, not simple fallback or news list)
    if (!answer.includes(botConfig.fallback) && !answer.includes("Latest Health Updates")) {
        finalResponse += `\n\n[Official Stamp: ${stamp}]`;
    }

    // Update analytics
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

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Required fields missing' });

    if (validateCredentials(username, password)) {
        const token = createSession();
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // We can't validate old password easily because we only store hash, 
    // but in a real app we would re-hash and check. 
    // Here we assume the session token is proof enough of identity, 
    // OR we can require them to send 'username' again to validate specific creds.
    // For MVP, we will just trust the Admin Token.

    if (!newPassword) return res.status(400).json({ error: "New password required" });

    changeAdminPassword(newPassword);
    res.json({ success: true, message: "Password updated successfully" });
});

app.get('/api/auth/status', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    res.json({ authenticated: validateSession(token) });
});

app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) deleteSession(token);
    res.json({ success: true });
});

// ===== ADMIN SYSTEM ENDPOINTS =====

// Settings / Config
app.get('/api/admin/config', requireAuth, (req, res) => {
    res.json(botConfig);
});

app.post('/api/admin/config', requireAuth, (req, res) => {
    const newConfig = req.body;
    botConfig = { ...botConfig, ...newConfig };
    saveData(DATA_FILES.config, botConfig);
    res.json({ success: true, message: 'Configuration saved' });
});

// News Management
app.get('/api/admin/news', requireAuth, (req, res) => {
    res.json(news);
});

app.post('/api/admin/news', requireAuth, (req, res) => {
    const item = req.body;
    if (!item.id) item.id = Date.now();
    if (!item.date) item.date = new Date().toISOString();

    const idx = news.findIndex(n => n.id === item.id);
    if (idx !== -1) news[idx] = item;
    else news.push(item);

    saveData(DATA_FILES.news, news);
    res.json({ success: true, item });
});

app.delete('/api/admin/news/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id);
    news = news.filter(n => n.id !== id);
    saveData(DATA_FILES.news, news);
    res.json({ success: true });
});

// Broadcast
app.post('/api/admin/broadcast', requireAuth, (req, res) => {
    const { message } = req.body; // In real app, maybe an ID of a news item

    console.log(`>>> BROADCASTING TO ${subscribers.length} SUBSCRIBERS: ${message}`);
    // In production, loop through 'subscribers' and use Twilio Client to send messages.

    res.json({ success: true, recipientCount: subscribers.length });
});

// Analytics
app.get('/api/admin/analytics', requireAuth, (req, res) => {
    res.json({ ...analytics, subscriberCount: subscribers.length });
});

app.post('/api/admin/reset-analytics', requireAuth, (req, res) => {
    analytics = { totalMessages: 0, activeUsers: 0, verifiedStamps: 0 };
    io.emit('analytics_update', analytics);
    res.json({ success: true });
});

// CMS / Pages
app.get('/api/pages/:slug', (req, res) => {
    const { slug } = req.params;
    if (pages[slug]) {
        res.json(pages[slug]);
    } else {
        res.status(404).json({ error: "Page not found" });
    }
});

app.post('/api/pages/:slug', requireAuth, (req, res) => {
    const { slug } = req.params;
    const { title, content } = req.body;
    pages[slug] = { title, content };
    saveData(DATA_FILES.pages, pages);
    res.json({ success: true });
});

// Knowledge Base (Enhanced)
app.get('/api/faqs', (req, res) => res.json(knowledge));

app.post('/api/faqs', requireAuth, (req, res) => {
    const newFaq = req.body;
    if (!newFaq.id) newFaq.id = Date.now();

    // Ensure links array structure
    if (!newFaq.links) newFaq.links = [];

    const index = knowledge.findIndex(k => k.id === newFaq.id);
    if (index !== -1) knowledge[index] = newFaq;
    else knowledge.push(newFaq);

    saveData(DATA_FILES.knowledge, knowledge);
    res.json({ success: true, faq: newFaq });
});

app.post('/api/admin/knowledge/bulk', requireAuth, (req, res) => {
    const items = req.body; // Expect array of { question, answer, keywords... }
    if (!Array.isArray(items)) return res.status(400).json({ error: "Expected array" });

    let count = 0;
    items.forEach(item => {
        if (!item.id) item.id = Date.now() + Math.random(); // simple unique id
        knowledge.push(item);
        count++;
    });

    saveData(DATA_FILES.knowledge, knowledge);
    res.json({ success: true, count });
});

app.delete('/api/faqs/:id', requireAuth, (req, res) => {
    const id = parseFloat(req.params.id); // float to handle random ids from bulk
    const index = knowledge.findIndex(k => k.id === id);
    if (index !== -1) {
        knowledge.splice(index, 1);
        saveData(DATA_FILES.knowledge, knowledge);
        res.json({ success: true });
    } else {
        // Try int parsing just in case
        const idInt = parseInt(req.params.id);
        const indexInt = knowledge.findIndex(k => k.id === idInt);
        if (indexInt !== -1) {
            knowledge.splice(indexInt, 1);
            saveData(DATA_FILES.knowledge, knowledge);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "FAQ not found" });
        }
    }
});

// Chat Simulator
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const answer = await findAnswer(message);
    const stamp = generateStamp(answer);
    analytics.totalMessages++;
    io.emit('analytics_update', analytics);
    res.json({ response: answer, stamp, timestamp: new Date() });
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected to dashboard');
    socket.emit('analytics_update', analytics);
    socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chatbot server running on port ${PORT}`);
});
