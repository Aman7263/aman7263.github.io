import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(express.static(".")); // serves email.js, index.html, etc.

/* ========= OPENAI ========= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ========= MOON IMAGE ========= */
app.post("/generate-moon", async (req, res) => {
  const { dob } = req.body;

  try {
    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Artistic symbolic moon on ${dob}`,
      size: "1024x1024"
    });

    res.json({ image: image.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

/* ========= SERVER ========= */
app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
