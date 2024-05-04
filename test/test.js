const fs = require('fs');
const ExcelJS = require('exceljs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const fraudDetectionPrompt = `
  prompt: Detect and flag any potential fraud elements within the given email in an ordered manner:

  fraud_elements:
  - Unrealistic Demands/Threats:
    - Phrases:
      - "Your [...] account is being compromised, need credentials to restore account"
      - "Delivery not successful, need payment to fix the issue"
      - "[...] processing paused, need payment/bank account to proceed"
      - "Family/friend needs financial help"
    - Phrasing Instilling Urgency:
      - "please handle this as soon as possible"
      - "it's urgent"
      - "click here to update your account details."
      - "urgent action required"
      - "account closed"
      - "send these details within 24 hours"
      - "you have been a victim of crime, click here immediately"
      - "Get started now"
      - Phrases containing 'now', 'immediate', and exclamation marks
  - Poor Spelling and Writing:
    - Examples:
      - "Youre"
      - "Please fill this form..."
      - "...account locked!!"
    - Grammatical, punctuation, and spelling mistakes
    - Imaginary words and phrases
  - Inconsistent or Faulty URLs:
    - Hyperlink addresses don’t match the embedded link
    - Buttons with hyperlinks leading to suspicious websites
  - Asking for Confidential Information:
    - Asking for [...] account details
    - Asking for bank account details
  - Vague Salutations:
    - Generic or no greetings
    - Examples:
      - "Dear valued member"
      - "Dear account holder"
      - "Dear customer"
      - "Dear member"
  - Generic or Improper Company Domains:
    - Using non-existent domains
    - Using generic domains
    - Using domains with characters and numbers appended
  - Inconsistent Sender Details and Email Header:
    - Sender name doesn't correlate with the sign-off name
    - Sender's IP address doesn't match the email service
    - "From" field does not match the "Return-Path" field
  - Incorrect Company Information:
    - Company details do not match real details
    - Sender email address does not correspond with the company details
    - Example:
      - British company not using a British address and phone number
      - Company motto/mission/values are incorrect
      - Company details are gibberish
  - Offering Unrealistic Rewards:
    - Wording that promises incredible monetary rewards
    - Example:
      - "Your reward is waiting"
  - Suspicious Attachments:
    - Attachments leading to malicious websites
    - Attachment files of high-risk types likely to contain malware (e.g., .scr, .exe, .zip)
  - Whole Email is Just a Hyperlink Leading to Malicious Website

  if the email does not contain fraud elements, reply with "this email is clean"
`;

async function testEmailFraud(emailText) {
  const chatModel = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer." + fraudDetectionPrompt],
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
  workbook.xlsx.readFile('dataset_test3.xlsx').then(async () => {

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
