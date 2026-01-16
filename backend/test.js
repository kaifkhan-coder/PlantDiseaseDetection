import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  // Use the latest supported model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const result = await model.generateContent("Say hello");
  console.log(result.response.text());
}

run().catch(err => console.error(err));