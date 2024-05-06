const falseNegativeReviewPrompt = `
    You are a cybersecurity expert who specialises in identifying phishing emails. 
    You fully understand the elements of a malicious phishing email and have successfully identified hundreds of them.
    Now, you are training new students who are facing trouble correctly identifying phishing emails.
    The following email has been wrongly identified by a student.
    Explain why the email may have been wrongly identified as legitimate when it is actually a malicious phishing email.
    When explaining, describe features of a phishing email that have been overlooked by the student, which led to an erroneous identification.
    Email:
    ‘‘‘<Insert email text data here>’’’
`;

module.exports = falseNegativeReviewPrompt;
