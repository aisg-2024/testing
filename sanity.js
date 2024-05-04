const { ChatOpenAI } = require("@langchain/openai");
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY); // Verify that the variable is loaded correctly

const chatModel = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getResponse() {
  try {
    let response = await chatModel.invoke("what is LangSmith?");
    console.log(response);
  } catch (error) {
    console.error("Error:", error);
  }
}

getResponse();
