import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const HF_TOKEN = process.env.HF_API_KEY;
const client = new InferenceClient(HF_TOKEN);

app.post("/generate-image", async (req, res) => {
  try {
    const { inputs } = req.body;
    if (!inputs) return res.status(400).json({ error: "Prompt required" });

    const imageBlob = await client.textToImage({
      provider: "nebius",
      model: "black-forest-labs/FLUX.1-dev",
      inputs,
      parameters: { num_inference_steps: 5 }
    });

    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    });

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
