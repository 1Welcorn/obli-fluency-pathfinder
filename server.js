// server.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente

const app = express();
app.use(express.json()); // Permite que o servidor entenda JSON

// Pega sua chave de API do arquivo .env
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Rota que seu frontend vai chamar
app.post('/ask-ai', async (req, res) => {
    try {
        const { message, history } = req.body; // Recebe a mensagem e o histórico do frontend

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Inicia o chat com o histórico recebido
        const chat = model.startChat({
            history: history || [], // Usa o histórico se ele existir
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao contatar a IA.');
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
