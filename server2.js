import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from 'langchain/llms/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { TextLoader } from 'langchain/document_loaders/fs/text';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔍 Load vector store
const vectorStore = await HNSWLib.load(
  path.join(__dirname, 'vector-store'),
  new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
);

// 🧠 Setup LLM
const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.3,
  modelName: 'gpt-3.5-turbo'
});

// 🧠 Retrieval QnA
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

app.post('/ask', async (req, res) => {
  const question = req.body.question;
  try {
    const response = await chain.call({ query: question });
    res.json({ answer: response.text });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3001, () => {
  console.log('✅ Server running on http://localhost:3001');
});
