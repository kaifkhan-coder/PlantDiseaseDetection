import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"   // ✅ WORKING MODEL
});

export async function detectDisease(base64Image) {
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      },
      "Identify the plant disease and give symptoms and treatment"
    ]);

    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini Error:", err.message);
    throw err;
  }
}
