const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getModels() {
  const models = await groq.models.list();
  console.log(models.data.map(m => m.id));
}

getModels();
