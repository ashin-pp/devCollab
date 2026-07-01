const { ChatGroq } = require("@langchain/groq");
const { HumanMessage } = require("@langchain/core/messages");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
require("dotenv").config();

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0,
  });
  
  const notifyTool = tool(
    async ({ targetName, title, message }) => {
        console.log(`Tool called with targetName=${targetName}, title=${title}, message=${message}`);
        return `Notification sent to user ${targetName} successfully.`;
    },
    {
        name: "notify_tool",
        description: "Sends a notification. Triggered by @notify.",
        schema: z.object({
            targetName: z.string().describe("The name or username of the person to notify"),
            title: z.string().describe("Notification title"),
            message: z.string().describe("Notification message"),
        }),
    }
  );

  const agent = createReactAgent({
    llm: model,
    tools: [notifyTool],
    messageModifier: "You are the Notify Agent. Only use your provided notify_tool to notify users. Do NOT use or hallucinate any other tools. Only use the tool exactly ONCE and then say you are done.",
  });
  
  console.log("Invoking agent...");
  try {
    const res = await agent.invoke({
        messages: [new HumanMessage("@notify Arun that we are deploying and @task write the deployment guide before tomorrow")]
    });
    console.log("Result:", res.messages.map(m => m.content));
  } catch (e) {
    console.log("Error:", e.message);
  }
}

run();
