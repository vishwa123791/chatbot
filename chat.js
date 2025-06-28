// chat.js
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { HumanMessage } from "@langchain/core/messages";
import readline from "readline";

// Set up CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const model = new ChatOllama({
  baseUrl: "http://127.0.0.1:11434",
  model: "llama3", 
});

const ask = () => {
  rl.question("\n🧠 Ask: ", async (question) => {
    const res = await model.invoke([new HumanMessage(question)]);
    console.log(`\n💬 Answer: ${res.content}`);
    ask(); // Keep asking
  });
};

ask();
