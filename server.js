import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

console.log("RUNNING FILE:", import.meta.url);


const app = express();

app.use(cors());
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;

// ✅ NEW ROUTER ENDPOINT
const HF_API_URL =
  "https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

console.log("HF token present:", !!HF_API_KEY);
console.log("HF token length:", HF_API_KEY?.length);

console.log("Registering /generate-image route");

app.get("/test", (req, res) => {
  res.send("Backend reachable!");
});


app.post("/generate-image", async (req, res) => {
  console.log("POST /generate-image called with body:", req.body);
  try {
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF Error:", errorText);
      return res.status(hfResponse.status).send(errorText);
    }

    const buffer = Buffer.from(await hfResponse.arrayBuffer());

    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
