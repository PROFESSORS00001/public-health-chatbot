const crypto = require('crypto');

// In-memory session storage (will reset on server restart)
const sessions = new Map();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default admin credentials (CHANGE THESE IN PRODUCTION!)
let ADMIN_CREDENTIALS = {
    username: 'admin',
    // Password: admin123 (hashed with SHA-256)
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

/**
 * Update admin password
 */
function updatePassword(newPassword) {
    ADMIN_CREDENTIALS.passwordHash = hashPassword(newPassword);
    return true;
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Generate a random session token
 */
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate admin credentials
 */
function validateCredentials(username, password) {
    if (username !== ADMIN_CREDENTIALS.username) {
        return false;
    }

    const hashedPassword = hashPassword(password);
    return hashedPassword === ADMIN_CREDENTIALS.passwordHash;
}

/**
 * Create a new session for authenticated admin
 */
function createSession() {
    const token = generateSessionToken();
    const session = {
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION
    };

    sessions.set(token, session);
    return token;
}

/**
 * Validate session token
 */
function validateSession(token) {
    if (!token) return false;

    const session = sessions.get(token);
    if (!session) return false;

    // Check if session expired
    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }

    return true;
}

/**
 * Delete session (logout)
 */
function deleteSession(token) {
    sessions.delete(token);
}

/**
 * Middleware to protect admin routes
 */
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!validateSession(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

/**
 * Clean up expired sessions (run periodically)
 */
function cleanupExpiredSessions() {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
        if (now > session.expiresAt) {
            sessions.delete(token);
        }
    }
}

// Clean up expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
    validateCredentials,
    createSession,
    validateSession,
    deleteSession,
    requireAuth,
    hashPassword,
    updatePassword
};
