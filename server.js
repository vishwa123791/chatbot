import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // For frontend

// ✅ Set up Ollama with llama3
const model = new ChatOllama({
  baseUrl: "http://127.0.0.1:11434",
  model: "llama3", 
});


app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    // ✨ Modify the prompt to encourage short answers directly
    const fullPrompt = `${question} (Answer in one short sentence.)`;

    const response = await model.invoke(fullPrompt);
    res.json({ answer: response.content.trim() });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
