const CoTPrompt = `
Detect and flag any potential fraud elements within the given email in an ordered manner:

  1. Check for Unrealistic Demands/Threats:
  - Look for phrases that manipulate urgency or demand sensitive information, such as requests for credentials to “restore” an account or demands for payment to resolve a non-existent issue.
  - Identify if the email contains phrases that instil urgency, like "urgent action required" or "click here immediately."

  2. Assess the Quality of Writing:
  - Examine the email for poor spelling, grammar, and punctuation errors. Common mistakes might include misspelled words (e.g., "Youre" instead of "You're") or overuse of exclamation marks.
  - Look for awkward phrasing or words that don't exist in standard dictionaries.

  3. Verify URLs and Hyperlinks:
  - Check if the hyperlink text matches the actual URL to which it directs. Often, fraudulent emails will display a legitimate-looking link text that leads to a malicious website when clicked.
  - Assess any buttons or links in the email to see if they lead to suspicious or unrelated websites.

  4. Identify Requests for Confidential Information:
  - Determine if the email explicitly asks for personal or financial information, like account details or bank information, which is a common red flag in phishing attempts.

  5. Examine Salutations and Greetings:
  - Note the use of generic salutations like “Dear customer” or “Dear member,” which may indicate that the sender does not actually know the recipient.

  6. Check for Issues with Company Domains and Sender Details:
  - Evaluate the legitimacy of the email’s domain and compare it with known domains of the alleged sender’s company.
  - Look for inconsistencies in the sender details, like mismatched names and email addresses.

  7. Assess Company Information for Accuracy:
  - Verify that the company information provided in the email (such as contact details or company mission) matches what’s publicly available or known to be true.

  8. Look for Offers of Unrealistic Rewards:
  - Be wary of wording that promises exceptional rewards, which can be a tactic to lure individuals into providing personal information.

  9. Inspect Attachments for Malicious Content:
  - Scrutinise any file attachments for unusual file types or names that might indicate a risk of malware.

  10. Check if the Whole Email is Just a Hyperlink:
  - Be cautious if the entire email content is hyperlinked, as it may lead to a malicious website intended to harvest personal details.
  Through this detailed, step-by-step analysis, we can determine if an email contains elements commonly associated with fraud or if it appears to be legitimate.

  After going through these 10 steps, if the email does not contain fraud elements, reply with "this email is clean"
  `;

module.exports = CoTPrompt;
