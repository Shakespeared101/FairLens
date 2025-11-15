// API utilities for WatchDogs extension

/**
 * Call Groq API for text summarization
 * @param {string} apiKey - Groq API key
 * @param {string} text - Text to summarize
 * @param {string} model - Model to use (default: mixtral-8x7b-32768)
 * @returns {Promise<object>} - API response
 */
async function callGroqAPI(apiKey, text, model = 'mixtral-8x7b-32768') {
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that analyzes privacy policies and summarizes them for users.'
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.3,
            max_tokens: 1500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    return await response.json();
}

/**
 * Test Groq API key validity
 * @param {string} apiKey - API key to test
 * @returns {Promise<boolean>} - True if valid
 */
async function testGroqAPIKey(apiKey) {
    try {
        const response = await callGroqAPI(apiKey, 'Test message');
        return response.choices && response.choices.length > 0;
    } catch (error) {
        console.error('API key test failed:', error);
        return false;
    }
}

/**
 * Available Groq models
 */
const GROQ_MODELS = {
    MIXTRAL: 'mixtral-8x7b-32768',
    LLAMA2: 'llama2-70b-4096',
    GEMMA: 'gemma-7b-it'
};

export { callGroqAPI, testGroqAPIKey, GROQ_MODELS };
