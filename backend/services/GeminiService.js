import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzePlantImage(base64Image) {
  const model = "gemini-3-flash-preview";

  const prompt = `
  As a world-class plant pathologist, analyze this image of a plant.
  Identify the plant species and determine diseases, pests, or deficiencies.
  Return JSON only.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          condition: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
        },
        required: ["plantName", "condition", "confidenceScore"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateSpeechReport(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
    },
  });

  return response.candidates[0].content.parts[0].inlineData.data;
}
