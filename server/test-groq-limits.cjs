const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const models = [
  "qwen/qwen3.6-27b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "openai/gpt-oss-20b",
  "qwen/qwen3-32b"
];

async function checkLimits() {
  for (const model of models) {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'hello' }],
        model: model,
        max_tokens: 1
      }).withResponse();
      
      const headers = response.response.headers;
      const tpm = headers.get('x-ratelimit-limit-tokens');
      const rpm = headers.get('x-ratelimit-limit-requests');
      
      console.log(`Model: ${model}`);
      console.log(`  TPM Limit: ${tpm}`);
      console.log(`  RPM Limit: ${rpm}`);
      console.log('---');
    } catch (e) {
      console.log(`Model: ${model} -> Error: ${e.message}`);
    }
  }
}

checkLimits();
