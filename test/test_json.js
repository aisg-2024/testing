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

async function main() {
  let truePositive = 0;
  let falsePositive = 0;
  let trueNegative = 0;
  let falseNegative = 0;
  const workbook = new ExcelJS.Workbook();
  workbook.xlsx.readFile('dataset_test4.xlsx').then(async () => {

    const worksheet = workbook.getWorksheet('Sheet1');
    console.log(worksheet.rowCount + " rows");
    // Array to store promises for testEmailFraud calls
    const promises = [];

    // Iterate over each row in the worksheet
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      const emailText = row.getCell(1).value; // Assuming email text is in the first column
      const expectedLabel = row.getCell(2).value; // Assuming label is in the second column

      // Push the promise returned by testEmailFraud to the promises array
      promises.push(new Promise(async (resolve) => {
        try {
          const fraudDetected = await testEmailFraud(emailText);
          if (fraudDetected === 1 && expectedLabel === 1) {
            truePositive++;
          } else if (fraudDetected === 1 && expectedLabel === 0) {
            falsePositive++;
            // Write false positive emails to a file
            fs.appendFileSync('false_positive.txt', `${emailText}\n`);
          } else if (fraudDetected === 0 && expectedLabel === 0) {
            trueNegative++;
          } else if (fraudDetected === 0 && expectedLabel === 1) {
            falseNegative++;
            // Write false negative emails to a file
            fs.appendFileSync('false_negative.txt', `${emailText}\n`);
          }
        } catch (error) {
          console.error("Error processing row:", rowNumber);
        } finally {
          resolve(); // Resolve the promise regardless of success or error
        }
      }));
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    console.log("True Positive:", truePositive);
    console.log("False Positive:", falsePositive);
    console.log("True Negative:", trueNegative);
    console.log("False Negative:", falseNegative);
    // Calculate evaluation metrics
    const precision = truePositive / (truePositive + falsePositive);
    const recall = truePositive / (truePositive + falseNegative);
    const accuracy = (truePositive + trueNegative) / (truePositive + falsePositive + trueNegative + falseNegative);
    const f1Score = 2 * (precision * recall) / (precision + recall);
    const fBetaScore = (1 + Math.pow(2, 2)) * (precision * recall) / (Math.pow(2, 2) * precision + recall);
    const f2Score = (5 * (precision * recall)) / (Math.pow(4, 2) * precision + recall);

    // Output evaluation metrics
    console.log("Precision:", precision);
    console.log("Recall:", recall);
    console.log("Accuracy:", accuracy);
    console.log("F1 Score:", f1Score);
    console.log("F Beta Score:", fBetaScore);
    console.log("F2 Score:", f2Score);
  }).catch(error => {
    console.error("Error:", error);
  });
}

main();
