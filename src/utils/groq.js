/**
 * groq.js — Groq LLM utility for the AI Progress Assistant
 *
 * RAG Flow:
 *   1. RETRIEVAL: Feedback data is fetched from Supabase (done in AIAssistant.jsx)
 *   2. AUGMENTATION: That data is injected into the system prompt as context
 *   3. GENERATION: Groq generates a natural-language response grounded in real data
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Calls the Groq LLM with a user question and retrieved DB context.
 *
 * @param {string} question - The parent's natural-language question
 * @param {string} feedbackContext - Structured feedback data retrieved from Supabase
 * @returns {Promise<string>} The AI-generated response
 */
export async function askGroq(question, feedbackContext) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            'Groq API key is not configured. Add VITE_GROQ_API_KEY to your .env.local file.'
        );
    }

    // AUGMENTATION: inject the retrieved DB data into the system prompt
    const systemPrompt = `You are a friendly skating school progress assistant. Your job is to help parents understand how their child is doing in ice skating classes based on instructor evaluation reports.

Here is the actual evaluation data retrieved from the database:

${feedbackContext}

Guidelines:
- Base your answers ONLY on the data provided above
- Be warm, encouraging, and parent-friendly
- Be specific — reference actual skills, dates, and class names from the data
- If asked about something not covered in the data, say so honestly
- Keep responses concise (2–4 sentences) unless a detailed breakdown is requested`;

    // GENERATION: send to Groq
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question },
            ],
            max_tokens: 450,
            temperature: 0.65,
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq API returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
