import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { detectDisease } from "./detectDisease.js";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import {protect} from "./middleware/authMiddleware.js";
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error", err));

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("❌ GOOGLE_API_KEY NOT FOUND");
}
console.log("GEMINI KEY:", process.env.GOOGLE_API_KEY);

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🌱 Plant Disease Detection API is running");
});

app.post("/api/detect-disease", async (req, res) => {
  try {
    const { image } = req.body;
    const result = await detectDisease(image);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/profile", protect, (req, res) => {
  res.json(req.user);
});


app.listen(process.env.PORT || 9000, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 9000}`);
});
