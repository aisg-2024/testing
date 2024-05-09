const researchPromptSplitJSON = `
  I want you to act as a spam detector to determine whether a given
  email is a phishing email or a legitimate email. Your analysis
  should be thorough and evidence-based. Phishing emails often
  impersonate legitimate brands and use social engineering techniques
  to deceive users. These techniques include, but are not limited to:
  fake rewards, fake warnings about account problems, and creating
  a sense of urgency or interest. Spoofing the sender address and
  embedding deceptive HTML links are also common tactics.
  Analyze the email by following these steps:
  1. Identify any impersonation of well-known brands.
  2. Examine the email header for spoofing signs, such as
  discrepancies in the sender name or email address.
  Evaluate the subject line for typical phishing characteristics
  (e.g., urgency, promise of reward). Note that the To address has
  been replaced with a dummy address.
  3. Analyze the email body for social engineering tactics designed to
  induce clicks on hyperlinks. Inspect URLs to determine if they are
  misleading or lead to suspicious websites.
  4. Provide a comprehensive evaluation of the email, highlighting
  specific elements that support your conclusion. Include a detailed
  explanation of any phishing or legitimacy indicators found in the
  email.
  5. Summarize your findings and provide your final verdict on the
  legitimacy of the email, supported by the evidence you gathered.
  `;

module.exports = researchPromptSplitJSON;
