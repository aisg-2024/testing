const fs = require('fs');
const ExcelJS = require('exceljs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const fraudDetectionPrompt = require('../prompts/fraudDetectionPrompt');
const CoTPrompt = require('../prompts/CoTPrompt');


require('dotenv').config({ path: '../.env' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log(OPENAI_API_KEY); // Verify that the variable is loaded correctly


async function testEmailFraud(emailText) {
  const chatModel = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
    model: 'gpt-3.5-turbo'
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", CoTPrompt],
    ["user", emailText]
  ]);

  const outputParser = new StringOutputParser();

  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  try {
    const response = await llmChain.invoke();
    const fraudDetected = response.toLowerCase().includes("fraud") ? 1 : 0;
    return fraudDetected;
  } catch (error) {
    console.error("Error:", error);
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
