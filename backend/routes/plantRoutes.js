import express from "express";
import { analyzePlantImage, generateSpeechReport } from "../services/geminiService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { image } = req.body;
    const report = await analyzePlantImage(image);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/speech", async (req, res) => {
  try {
    const { text } = req.body;
    const audio = await generateSpeechReport(text);
    res.json({ audio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
