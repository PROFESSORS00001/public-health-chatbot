const fetch = require('node-fetch');

/**
 * Get AI-powered response from OpenAI for health-related questions
 * Falls back to generic response if API is not configured
 */
async function getAIResponse(userMessage) {
    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback if no API key configured
    if (!apiKey) {
        console.warn('OpenAI API key not configured. Using fallback response.');
        return "I'm here to help with health questions. For the best experience, please configure the OpenAI API key.";
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a warm, engaging, and highly knowledgeable Public Health Assistant. 
                        
                        CORE IDENTITY:
                        - You are capable of answering over 1000+ health-related topics, from common colds to complex chronic conditions.
                        - You are interactive and conversational, not robotic. Use emojis occasionally (e.g., 🩺, 🍎, 💪) to be friendly.
                        - You can render links using standard markdown: [Link Text](URL). 
                        - If recommending resources, provide real clickable links if you know them (e.g., to WHO, CDC, or Ministry of Health sites).

                        GUIDELINES:
                        - Provide concise, accurate health information based on global health standards (WHO/CDC).
                        - Keep responses under 250 words unless asked for detailed guides.
                        - Be empathetic. If a user says they are in pain, acknowledge it.
                        - For medical emergencies, START with a warning to seek professional help immediately.
                        
                        FACT CHECKING:
                        - If the user asks about specific local events or rumors ("Is it true X happened in Y?"), YOU MUST SAY: "I cannot independently verify specific local reports. Please check with an official Ministry of Health office."
                        - Do not hallucinate local stats. Stick to general medical knowledge.
                        `
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Fallback response
        return "I'm currently having trouble processing your request. Please try again in a moment, or contact your local health authority for immediate assistance.";
    }
}

module.exports = { getAIResponse };
