import { GoogleGenerativeAI } from "@google/generative-ai";
import { envConfig } from "./src/infra/config/envConfig.js";

const genAI = new GoogleGenerativeAI(envConfig.geminiApiKey);

async function run() {
  // We don't have a direct listModels exposed cleanly in the JS SDK without the raw REST call,
  // but let's try a direct raw REST call using fetch.
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${envConfig.geminiApiKey}`);
  const data = await response.json();
  console.log("Available models:");
  data.models.forEach(m => {
    if (m.supportedGenerationMethods.includes("generateContent")) {
      console.log(m.name);
    }
  });
}
run();
