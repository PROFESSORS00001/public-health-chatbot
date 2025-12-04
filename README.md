# Public Health Chatbot & Admin Panel

A comprehensive public health chatbot system with a React frontend, Node.js backend, and Admin Panel for management.

## Features
- **AI Chatbot:** Answers public health questions using OpenAI (with keyword fallback).
- **Admin Panel:** Secure dashboard to manage FAQs, view analytics, and configure the bot.
- **Verification:** "Official Stamp" generation for verified information.
- **Analytics:** Real-time tracking of messages and users.

## Project Structure
- `client/`: React Frontend (Vite + Tailwind CSS).
- `bot/`: Node.js Backend (Express + Socket.io).

## Setup & Deployment

### Local Development
1.  **Backend:**
    ```bash
    cd bot
    npm install
    node index.js
    ```
2.  **Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

### Deployment
- **Frontend:** Deploy the `client` folder to **Netlify**.
- **Backend:** Deploy the `bot` folder to **Render**.

See `DEPLOY.md` for detailed deployment instructions.
