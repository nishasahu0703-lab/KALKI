import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, schema } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const config: any = schema ? {
      responseMimeType: "application/json",
      responseSchema: schema
    } : {};

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: config
    });
    
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
}
