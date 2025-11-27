import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysis, Language } from "../types";

// Helper to convert File to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, artistic, 3-5 word title for the photo.",
    },
    description: {
      type: Type.STRING,
      description: "A warm, engaging, and descriptive caption (1-2 sentences) about the photo's content and atmosphere.",
    },
    mood: {
      type: Type.STRING,
      description: "A single word describing the emotional tone (e.g., Nostalgic, Vibrant, Serene).",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 relevant hashtags.",
    },
  },
  required: ["title", "description", "mood", "tags"],
};

export const analyzeImageWithGemini = async (file: File, language: Language): Promise<AIAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(file);

    const langInstruction = language === 'zh' 
      ? "Respond in Chinese (Simplified). Ensure the tone is poetic and suitable for social media." 
      : "Respond in English.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          {
            text: `Analyze this image. Provide a creative title, a descriptive caption suitable for social media, the mood, and relevant tags. ${langInstruction} Return in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};