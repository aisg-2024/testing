const { ChatOpenAI } = require("@langchain/openai");
const { JsonOutputFunctionsParser } = require("langchain/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const prompt1 = require('../prompts/prompt1');
const prompt2 = require('../prompts/prompt2');
const prompt3 = require('../prompts/prompt3');
const prompt4 = require('../prompts/prompt4');
const fraud_email = require("../email_content/fraud_email")
const fs = require('fs');
const ExcelJS = require('exceljs');


require('dotenv').config({ path: '../.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY); // Verify that the API key is loaded correctly

const chatModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model: 'gpt-3.5-turbo'
});

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
  name: "extractor",
  description: "Extracts fields from the input.",
  parameters: {
    type: "object",
    properties: {
      is_phishing: {
        type: "string",
        enum: ["true", "false"],
        description: "a boolean value indicating whether the email is phishing (true) or legitimate (false).",
      },
      phishing_score: {
        type: "number",
        description: "phishing risk confidence score as an integer on a scale from 0 to 10,  0 to 5 means legitimate, 6 to 10 means phishing",
      },
      brand_impersonation: {
        type: "string",
        description: "brand name associated with the email, if applicable.",
      },
      rationale: {
        type: "string",
        description: "detailed rationales for the determination, up to 500 words.",
      },
      brief_rationale: {
        type: "string",
        description: "brief reason for the determination.",
      }
    },
    required: ["is_phishing", "phishing_score", "brand_impersonation", "rationale", "brief_rationale"],
  },
};

let counter = 0;

async function testEmailFraud(emailText) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", prompt4],
    ["user", emailText]
  ]);

  const model_params = chatModel.bind({
    functions: [extractionFunctionSchema],
    function_call: { name: "extractor" },
  })

  const runnable = prompt.pipe(model_params).pipe(parser);

  try {
    const result = await runnable.invoke();
    console.log(result)
    const is_phishing = result.is_phishing === "true"; // Convert to boolean
    counter++;
    console.log(counter)
    const fraudDetected = is_phishing ? 1 : 0;
    return fraudDetected;
  } catch (error) {
    console.error("Error processing email:", error);
    return null;
  }
}

response = testEmailFraud(fraud_email)
console.log(response)
