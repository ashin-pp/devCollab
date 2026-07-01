const { ChatGroq } = require("@langchain/groq");
const { HumanMessage } = require("@langchain/core/messages");
require("dotenv").config();

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0,
  });
  
  const res = await model.invoke([new HumanMessage("say hello")]);
  console.log(res);
}

run();
