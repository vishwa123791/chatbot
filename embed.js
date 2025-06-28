import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { HumanMessage } from '@langchain/core/messages';
import readline from 'readline';
// Initialize models
const ollamaEmbeddings = new OllamaEmbeddings({ model: 'mistral' });
const ollamaModel = new ChatOllama({ model: 'mistral' });

// Load vector store from disk
const vectorStore = await HNSWLib.load('./vector-store', ollamaEmbeddings);

// Ask function
async function ask(question) {
  const results = await vectorStore.similaritySearch(question, 1); // use k = 1 for speed
  const context = results.map(r => r.pageContent).join('\n');

  const userPrompt = `
Use the following context to answer the question:
${context}
Question: ${question}
Answer:
  `;

  const response = await ollamaModel.invoke([new HumanMessage(userPrompt)]);
  console.log('\nQuestion:', question);
  console.log('Answer:', response.content);
}

// Terminal input support
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = process.argv.slice(2).join(' ');

if (question) {
  await ask(question);
  rl.close();
} else {
  rl.question('Ask a question: ', async (q) => {
    await ask(q);
    rl.close();
  });
}
