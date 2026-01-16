
// import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
// import { PlantHealthReport, GroundingResult } from "../types";

// export const analyzePlantImage = async (base64Image: string): Promise<PlantHealthReport> => {
//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
//   const model = 'gemini-3-flash-preview';

//   const prompt = `
//     As a world-class plant pathologist, analyze this image of a plant. 
//     Identify the plant species and determine if it has any diseases, pests, or nutrient deficiencies.
//     Provide a detailed diagnostic report in JSON format.
//   `;

//   const response = await ai.models.generateContent({
//     model,
//     contents: [
//       {
//         parts: [
//           { text: prompt },
//           {
//             inlineData: {
//               mimeType: "image/jpeg",
//               data: base64Image.split(',')[1] || base64Image
//             }
//           }
//         ]
//       }
//     ],
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.OBJECT,
//         properties: {
//           plantName: { type: Type.STRING },
//           condition: { 
//             type: Type.STRING,
//             enum: ['Healthy', 'Diseased', 'Stressed', 'Unknown']
//           },
//           diseaseName: { type: Type.STRING },
//           confidenceScore: { type: Type.NUMBER },
//           symptoms: { 
//             type: Type.ARRAY,
//             items: { type: Type.STRING }
//           },
//           causes: { 
//             type: Type.ARRAY,
//             items: { type: Type.STRING }
//           },
//           treatment: {
//             type: Type.OBJECT,
//             properties: {
//               immediateActions: { 
//                 type: Type.ARRAY,
//                 items: { type: Type.STRING }
//               },
//               longTermCare: { 
//                 type: Type.ARRAY,
//                 items: { type: Type.STRING }
//               },
//               recommendedProducts: { 
//                 type: Type.ARRAY,
//                 items: { type: Type.STRING }
//               }
//             },
//             required: ['immediateActions', 'longTermCare']
//           },
//           prevention: { 
//             type: Type.ARRAY,
//             items: { type: Type.STRING }
//           },
//           isContagious: { type: Type.BOOLEAN },
//           severity: { 
//             type: Type.STRING,
//             enum: ['Low', 'Medium', 'High', 'Critical']
//           }
//         },
//         required: ['plantName', 'condition', 'confidenceScore', 'symptoms', 'causes', 'treatment', 'prevention', 'isContagious', 'severity']
//       }
//     }
//   });

//   try {
//     return JSON.parse(response.text);
//   } catch (error) {
//     console.error("Failed to parse Gemini response:", error);
//     throw new Error("Could not interpret the analysis results.");
//   }
// };

// export const generatePlantIcon = async (plantName: string): Promise<string> => {
//   const name = plantName.toLowerCase();

//   if (name.includes("tomato"))
//     return "https://api.iconify.design/mdi:fruit-tomato.svg";

//   if (name.includes("wheat"))
//     return "https://api.iconify.design/mdi:barley.svg";

//   if (name.includes("rice"))
//     return "https://api.iconify.design/mdi:sprout.svg";

//   return "https://api.iconify.design/mdi:leaf.svg";
// };


// export async function searchTreatmentProducts(plant, disease) {
//   return {
//     sources: [
//       {
//         title: "Search pesticides & treatments",
//         uri: `https://www.google.com/search?q=${encodeURIComponent(
//           `${plant} ${disease} pesticide fungicide`
//         )}`
//       },
//       {
//         title: "Amazon agriculture products",
//         uri: `https://www.amazon.in/s?k=${encodeURIComponent(
//           `${plant} ${disease} fungicide`
//         )}`
//       },
//       {
//         title: "Flipkart farm solutions",
//         uri: `https://www.flipkart.com/search?q=${encodeURIComponent(
//           `${plant} plant disease medicine`
//         )}`
//       }
//     ]
//   };
// }

// export const findNearbyExperts = async (lat: number, lng: number): Promise<GroundingResult> => {
//   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Find highly-rated plant nurseries, garden centers, or plant pathology experts near this location.",
//     config: {
//       tools: [{ googleMaps: {} }],
//       toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
//     },
//   });

//   const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
//     ?.map((c: any) => c.maps)
//     .filter(Boolean) || [];

//   return { text: response.text, sources };
// };

// export const generateSpeechReport = async (reportText: string): Promise<string> => {
//   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash-preview-tts",
//     contents: [{ parts: [{ text: `Summarize and read this pathology report in a helpful, expert tone: ${reportText}` }] }],
//     config: {
//       responseModalities: [Modality.AUDIO],
//       speechConfig: {
//         voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
//       },
//     },
//   });

//   const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
//   if (!audioData) throw new Error("No audio returned");
//   return audioData;
// };
const API = process.env.VITE_API_URL;

export async function analyzePlantImage(base64Image: string) {
  const res = await fetch(`${API}/api/plant/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function generateSpeechReport(text: string) {
  const res = await fetch(`${API}/api/plant/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  return data.audio;
}
