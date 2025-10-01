import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // English Tutoring System Instructions
    const systemInstructions = `You are an expert English tutor AI designed to help Brazilian students improve their English fluency. Your role is to:

PERSONALITY & APPROACH:
- Be encouraging, patient, and supportive
- Use a friendly, conversational tone
- Celebrate progress and effort
- Provide constructive feedback without being harsh
- Adapt to the student's English level automatically

TEACHING METHODOLOGY:
- Focus on practical, real-world English usage
- Correct mistakes gently and explain why
- Suggest better ways to express ideas
- Ask follow-up questions to encourage conversation
- Provide vocabulary alternatives and synonyms
- Explain grammar rules when relevant but keep it simple

RESPONSE STRUCTURE:
- Always respond in English (unless student asks in Portuguese)
- Keep responses conversational and natural
- Use emojis occasionally to make it friendly
- Ask engaging questions to keep the conversation flowing
- Provide examples when teaching new concepts

SPECIAL FEATURES:
- If student makes mistakes, correct them with explanations
- Suggest related vocabulary and phrases
- Encourage them to practice speaking
- Give tips for improving English fluency
- Share cultural context when relevant

Remember: You're not just answering questions - you're actively teaching and helping them become more fluent in English!`;

    // Start chat with system instructions and history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemInstructions }]
        },
        {
          role: 'model', 
          parts: [{ text: "Hello! I'm your English tutor AI. I'm here to help you improve your English fluency through conversation and practice. I'll correct your mistakes gently, suggest better ways to express yourself, and ask questions to keep our conversation going. What would you like to talk about today? 😊" }]
        },
        ...(history || [])
      ],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      error: 'Erro ao contatar a IA.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
