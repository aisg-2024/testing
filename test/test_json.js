const { ChatOpenAI } = require("@langchain/openai");
const { JsonOutputFunctionsParser } = require("langchain/output_parsers");
const { HumanMessage } = require("@langchain/core/messages");

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
      tone: {
        type: "string",
        enum: ["positive", "negative"],
        description: "The overall tone of the input",
      },
      word_count: {
        type: "number",
        description: "The number of words in the input",
      },
      chat_response: {
        type: "string",
        description: "A response to the human's input",
      },
    },
    required: ["tone", "word_count", "chat_response"],
  },
};

async function runExtraction() {
  // Create a new runnable, bind the function to the model, and pipe the output through the parser
  const runnable = chatModel
    .bind({
      functions: [extractionFunctionSchema],
      function_call: { name: "extractor" },
    })
    .pipe(parser);

  // Invoke the runnable with an input
  const result = await runnable.invoke([
    new HumanMessage("What a beautiful day!"),
  ]);

  console.log({ result });
}

runExtraction();
