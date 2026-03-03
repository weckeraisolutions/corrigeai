import { GoogleGenAI } from '@google/genai';

export const handler = async (event, context) => {
    // Only allow POST requests
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: "A chave de API não foi configurada. Por favor, configure a variável de ambiente API_KEY no painel do Netlify."
                })
            };
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const body = JSON.parse(event.body || '{}');
        const { model, contents, config } = body;

        if (!contents) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: "Missing contents in request body" })
            };
        }

        const response = await ai.models.generateContent({
            model: model || 'gemini-2.5-pro',
            contents: contents,
            config: config
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error("Error calling Gemini API from Netlify Function:", error);

        const errorStatus = error?.status || error?.code || 500;
        const errorMessage = error?.message || 'Error communicating with Gemini API';

        return {
            statusCode: errorStatus,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: errorMessage, details: error })
        };
    }
};
