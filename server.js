import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large payloads like document text

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

app.post('/api/generate', async (req, res) => {
    try {
        const { model, contents, config } = req.body;

        if (!process.env.API_KEY) {
            return res.status(500).json({
                error: "A chave de API não foi configurada no servidor (arquivo .env). Por favor, configure a variável de ambiente API_KEY."
            });
        }

        if (!contents) {
            return res.status(400).json({ error: "Missing contents in request body" });
        }

        const response = await ai.models.generateContent({
            model: model || 'gemini-2.5-pro',
            contents: contents,
            config: config
        });

        res.json(response);
    } catch (error) {
        console.error("Error calling Gemini API from backend:", error);

        const errorStatus = error?.status || error?.code || 500;
        const errorMessage = error?.message || 'Error communicating with Gemini API';

        res.status(errorStatus).json({ error: errorMessage, details: error });
    }
});

app.listen(port, () => {
    console.log(`Backend server proxy for CorrigeAI running at http://localhost:${port}`);
});
