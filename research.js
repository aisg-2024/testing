const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const researchPrompt = require('./prompts/researchPrompt');
const researchPromptJSON = require('./prompts/researchPromptJSON')
const fraud_email = require('./email_content/fraud_email');

require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY); // Verify that the variable is loaded correctly

    // Initialize the OpenAI model with the API key
    const chatModel = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
  });

async function main() {
    // Prepare the prompt with the system and user messages
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", researchPromptJSON],
        ["user", fraud_email],
    ]);

    // Initialize the output parser
    const outputParser = new StringOutputParser();

    // Create a processing chain from prompt to model invocation to parsing
    const llmChain = prompt.pipe(chatModel).pipe(outputParser);

    try {
        // Invoke the chain to get the response from the language model
        const response = await llmChain.invoke();
        console.log("Response from language model:", response);

        const data = JSON.parse(response);
        const fraudDetected = data.is_phishing;
        console.log(fraudDetected)

        return { response, fraudDetected };
    } catch (error) {
        console.error("Error in detecting fraud:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

main();
