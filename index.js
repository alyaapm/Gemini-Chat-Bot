import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Inisialisasi client Google Gen AI SDK menggunakan API Key dari .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(cors());
app.use(express.json());

// Mengizinkan Express menyajikan file statis (frontend) dari folder 'public'
app.use(express.static('public'));

// Endpoint POST /api/chat untuk memproses riwayat chat (multi-turn conversation)
app.post('/api/chat', async (req, res) => {
    try {
        const { conversation } = req.body;

        if (!conversation || !Array.isArray(conversation)) {
            return res.status(400).json({ error: 'Conversation harus berupa array data percakapan.' });
        }

        // Format riwayat pesan agar sesuai dengan spesifikasi format SDK @google/genai
        // Struktur: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
        const contents = conversation.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Mengirimkan konten dan konfigurasi parameter kreatif ke model Gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                temperature: 0.7, // Mengontrol kreativitas respons (0.0 - 2.0)
                systemInstruction: "Kamu adalah asisten AI dari Hacktiv8 yang ramah, solutif, dan selalu menjawab dalam Bahasa Indonesia." // Persona bot
            }
        });

        // Mengembalikan properti 'result' berisi respons teks dari Gemini AI
        res.json({ result: response.text });

    } catch (error) {
        console.error('Error pada /api/chat:', error);
        res.status(500).json({ error: 'Failed to get response from server.' });
    }
});

app.listen(port, () => {
    console.log(`Server backend berjalan di http://localhost:${port}`);
});