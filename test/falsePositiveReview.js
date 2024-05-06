const ExcelJS = require('exceljs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const falsePositiveReviewPrompt = require('../prompts/falsePositiveReviewPrompt');

require('dotenv').config({ path: '../.env' });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function reviewError(emailText) {
    const chatModel = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    });
  
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", falsePositiveReviewPrompt],
      ["user", emailText]
    ]);
  
    const outputParser = new StringOutputParser();
  
    const llmChain = prompt.pipe(chatModel).pipe(outputParser);
  
    try {
      const response = await llmChain.invoke();
      return response;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }
  
  async function main() {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile('false_positive.xlsx').then(async () => {

        const worksheet = workbook.getWorksheet('Sheet1');
        console.log(worksheet.rowCount + " rows");
        // Array to store promises for reviewError calls
        const promises = [];

        // Iterate over each row in the worksheet
        worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const emailText = row.getCell(1).value; // Email text is in the first column

        // Push the promise returned by reviewError to the promises array
        promises.push(new Promise(async (resolve) => {
            try {
            const llmReview = await reviewError(emailText);
            row.getCell(2).value = llmReview;
            row.commit();
            workbook.xlsx.writeFile('false_positive.xlsx')
            } catch (error) {
            console.error("Error processing row:", rowNumber);
            } finally {
            resolve(); // Resolve the promise regardless of success or error
            }
        }));
        });
        // Wait for all promises to resolve
        await Promise.all(promises);
    }).catch(error => {
        console.error("Error:", error);
    });
}

main();