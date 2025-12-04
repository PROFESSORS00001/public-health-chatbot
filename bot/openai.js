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
                        content: `You are a helpful public health assistant chatbot. Provide concise, accurate health information based on WHO and CDC guidelines. 
                        - Keep responses under 200 words
                        - Be empathetic and supportive
                        - For medical emergencies, always advise seeking immediate professional help
                        - Cite general health guidelines, not personal medical advice
                        - If unsure, recommend consulting a healthcare provider`
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
