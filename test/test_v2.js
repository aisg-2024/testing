const fs = require('fs');
const ExcelJS = require('exceljs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const fraudDetectionPrompt = require('../prompts/fraudDetectionPrompt');
const CoTPrompt = require('../prompts/CoTPrompt');
const RolePrompt = require('../prompts/RolePrompt');
const researchPromptJSON = require('../prompts/researchPromptJSON');

require('dotenv').config({ path: '../.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY); // Verify that the API key is loaded correctly

const chatModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model: 'gpt-3.5-turbo'
});

async function testEmailFraud(emailText) {
  const cleanEmailText = emailText.replace(/['"]/g, '');
  // console.log(cleanEmailText)

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", researchPromptJSON],
    ["user", cleanEmailText]
  ]);

  const outputParser = new StringOutputParser();

  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  try {
    const response = await llmChain.invoke();
    logResponse(response);    // Log response
    const data = naiveJSONFromText(response);
    const fraudDetected = data.is_phishing ? 1 : 0;
    return fraudDetected;
  } catch (error) {
    console.error("Error processing email:", error);
    logError(emailText, error, cleanEmailText);
    return null;
  }
}

function logError(emailText, error) {
  const message = `"${emailText.replace(/"/g, '""')}", "${error.message.replace(/"/g, '""')}"\n`;
  fs.appendFileSync('error_log.csv', message, { encoding: 'utf8' });
}

function logResponse(response) {
  const separator = "________________________________\n";
  fs.appendFileSync('responses.txt', response + separator, { encoding: 'utf8' });
}

function naiveJSONFromText(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
      return JSON.parse(match[0]);
  } catch {
      return null;
  }
};

async function main() {
  // Write header for CSV log file
  fs.writeFileSync('error_log.csv', '"Email Text","Error Message","Original Email Text"\n', { encoding: 'utf8' });

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
