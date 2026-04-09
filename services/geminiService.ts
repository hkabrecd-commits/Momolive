
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const chatStream = async (message: string, history: { role: string; content: string }[], onChunk: (text: string) => void) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es SOFIA AI, une assistante intelligente premium. Réponds avec élégance et précision.",
    }
  });
  
  const response = await chat.sendMessageStream({ message });
  for await (const chunk of response) {
    onChunk(chunk.text || '');
  }
};

export const generateImage = async (prompt: string, base64Image?: string) => {
  const ai = getAI();
  const parts: any[] = [{ text: prompt }];
  if (base64Image) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: 'image/png'
      }
    });
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const scolaireAnalysis = async (prompt: string, fileData?: { data: string; mimeType: string }) => {
  const ai = getAI();
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: fileData
    });
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: "Tu es un expert scolaire. Utilise LaTeX pour les mathématiques. Formate tes réponses pour un PDF premium.",
    }
  });
  
  return response.text;
};

export const scolaireAnalysisStream = async (prompt: string, onChunk: (text: string) => void, fileData?: { data: string; mimeType: string }) => {
  const ai = getAI();
  const parts: any[] = [{ text: prompt }];
  if (fileData) {
    parts.push({
      inlineData: fileData
    });
  }
  
  const response = await ai.models.generateContentStream({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: "Tu es un expert scolaire. Utilise LaTeX pour les mathématiques. Formate tes réponses pour un PDF premium.",
    }
  });
  
  for await (const chunk of response) {
    onChunk(chunk.text || '');
  }
};

export const translateText = async (text: string, targetLang: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text to ${targetLang}: "${text}"`,
  });
  return response.text;
};

export const translateTextStream = async (text: string, targetLang: string, onChunk: (text: string) => void) => {
  const ai = getAI();
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text to ${targetLang}: "${text}"`,
  });
  for await (const chunk of response) {
    onChunk(chunk.text || '');
  }
};

export const generateAffiche = async (prompt: string) => {
  const ai = getAI();
  
  // 1. Enhance the prompt using the text model
  const enhanceChat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es un expert en direction artistique et en création de prompts pour la génération d'images (Midjourney, DALL-E, Imagen). Ton rôle est de prendre une idée simple de l'utilisateur et de la transformer en un prompt ultra précis, descriptif et professionnel en anglais pour générer une affiche publicitaire stylisée, percutante et de haute qualité. Ne renvoie QUE le prompt en anglais, sans aucun autre texte.",
    }
  });
  
  const enhanceResponse = await enhanceChat.sendMessage({ message: prompt });
  const enhancedPrompt = enhanceResponse.text || prompt;
  
  // 2. Generate the image using the enhanced prompt
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: enhancedPrompt,
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        enhancedPrompt,
        imageUrl: `data:image/png;base64,${part.inlineData.data}`
      };
    }
  }
  return null;
};
