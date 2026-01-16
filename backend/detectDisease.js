import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Only Vision model works for image input
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-vision" });

export async function detectDisease(base64Image) {
  try {
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image, // your base64 string WITHOUT "data:image/jpeg;base64,"
        },
      },
      "Analyze this plant image. Identify disease (if any) and suggest treatments in JSON format.",
    ]);

    // Gemini Vision response comes as text
    const text = response.response.text();

    // Optional: parse JSON if you output structured JSON in prompt
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text }; // fallback if text isn't strict JSON
    }

    return result;
  } catch (err) {
    console.error("❌ Disease detection failed:", err);
    throw new Error("Disease detection failed via Gemini API.");
  }
}
