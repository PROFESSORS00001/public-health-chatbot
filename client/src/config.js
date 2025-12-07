// Centralized API Configuration
// This ensures we always point to the correct backend, whether local or production.

const getApiUrl = () => {
    // 1. If explicit env var is set (e.g. at build time), use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. Check current hostname to determine environment
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    } else {
        // Production fallback (Render)
        return 'https://public-health-chatbot.onrender.com';
    }
};

export const API_URL = getApiUrl();
