# Deployment Guide

This guide explains how to deploy your Public Health Chatbot. Since the application has a separate Frontend (React) and Backend (Node.js), they need to be deployed separately.

## 1. Backend Deployment (Render.com)

The backend needs a server to run Node.js. Netlify is primarily for static sites, so we recommend **Render** (it has a free tier).

1.  **Push your code to GitHub.**
2.  **Sign up for Render** (https://render.com).
3.  **Create a new Web Service**.
4.  Connect your GitHub repository.
5.  **Settings:**
    *   **Root Directory:** `bot`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
6.  **Environment Variables:**
    *   Add `OPENAI_API_KEY` with your key.
    *   Add `PORT` (set to `3000` or let Render decide).
7.  **Deploy.** Render will give you a URL (e.g., `https://my-bot-backend.onrender.com`).

## 2. WhatsApp Configuration (Twilio)

To connect your deployed backend to WhatsApp:

1.  **Log in to Twilio Console.**
2.  Go to **Messaging** -> **Services** -> **(Your WhatsApp Service)**.
3.  In **Inbound Settings**, set the **Webhook URL** to:
    *   `https://<YOUR-RENDER-URL>/whatsapp`
    *   Example: `https://public-health-chatbot.onrender.com/whatsapp`
    *   Ensure the method is **POST**.
4.  **Save** the settings.

### Troubleshooting WhatsApp
*   **No Reply:** Check Render logs. If you see `Incoming WhatsApp payload`, the request reached the server.
*   **OpenAI Quota Error:** If you see "insufficient_quota" in logs, either add a funded API key or the bot will fall back to keyword matching (as currently configured).


## 3. Frontend Deployment (Netlify)

The frontend can be hosted on Netlify.

### Preparation
Before deploying, you need to tell the frontend where the backend is.

1.  Open `client/src/pages/Admin.jsx`, `client/src/context/AuthContext.jsx`, and `client/src/App.jsx` (and any other files making API calls).
2.  Replace `http://localhost:3000` with your **Render Backend URL** (e.g., `https://my-bot-backend.onrender.com`).
    *   *Tip: In a production app, use environment variables like `import.meta.env.VITE_API_URL`.*

### Deploying to Netlify
1.  **Sign up for Netlify** (https://netlify.com).
2.  **Add New Site** -> **Import from Git**.
3.  Connect your GitHub repository.
4.  **Build Settings:**
    *   **Base directory:** `client`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
5.  **Deploy Site.**

## 4. Final Steps
1.  Once both are deployed, open your Netlify URL.
2.  Test the Chatbot and Admin Panel.
3.  **Important:** The Admin Panel uses in-memory storage for the MVP. If the backend restarts (which happens on free tiers), settings and sessions will be reset. For a real production app, you should use a database (like MongoDB).
