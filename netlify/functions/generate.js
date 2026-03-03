import { GoogleGenAI } from '@google/genai';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: 'API_KEY não configurada na Netlify.'
                })
            };
        }

        const ai = new GoogleGenAI({ apiKey });

        const body = JSON.parse(event.body || '{}');
        const { model, contents } = body;

        if (!contents) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing contents' })
            };
        }

        // 🔥 LIMITADOR PARA EVITAR TIMEOUT
        const limitedContents =
            typeof contents === 'string'
                ? contents.slice(0, 15000)
                : contents;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000); // 9s

        const response = await ai.models.generateContent({
            model: model || 'gemini-3.1-flash-lite-preview',
            contents: limitedContents,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.3
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Gemini Error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error?.message || 'Erro interno'
            })
        };
    }
};