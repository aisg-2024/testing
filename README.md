# Testing for google chrome extension on fraud email detection

## Prompts used
The prompt given to the model is of the same structure as the one mentioned in the langchain_backend repository, which can be found [here](https://github.com/aisg-2024/langchain_backend?tab=readme-ov-file#prompting-techniques). 

## Test Methodology

#### Dataset
The datasets used for testing are derived from the existing datasets curated by Zenodo, which can be found [here](https://zenodo.org/records/8339691). 

The datasets consist of entries of both fraud and non-fraud emails, which are arranged in 2 columns. The first column contains the various key information about an email, including `sender`, `receiver`, `date`, `subject` and `body` of the email. The second column is a binary label of 0 and 1, with 0 indicating non-fraud and 1 indicating a fraud email.

#### Evaluation Criteria
Since the classification of fraud vs non-fraud is binary, we evaluated the performance of the model using some of the standard criteria used for such classification problems.

- Confusion Matrix
- Precision
- Accuracy
- Recall
- F1 score
- F2 score

#### Test Procedure
We iterate through the entire dataset of emails from beginning to end. For each email data entry, the various information are stored in the `emailText` string variable and passed in as part of the prompt to be evaluated by the model. After which, the response by the model will be compared to the label for this entry and classified under one of the 4 outcomes of a stadard confusion matrix (true positive(TP), false positive(FP), true negative(TN), false negative(FN)). 

After all data entries have been evaluated, the total number of TP, FP, TN, FN will be used to calculate the various scores as mentioned above.

## Test Result Analysis

Due to the rate limit of 160000 tokens per minute, we are only able to test up to approximately 400 entries at once. After repeated test runs, the test results are as follow:
| Evaluation Metric      | Result (out of 1) |
| ----------- | ----------- |
| Accuracy      | 0.889       |
| Precision   | 0.936        |
| Recall   | 0.781        |
| F1 score   | 0.833        |
| F2 score   | 0.224        |

The **Accuracy** and **Precision** of the model with the given prompt are relatively high, indicating that when it predicts an email as fraudulent, it is very likely to be correct. The **F1 score** , which is a balanced measure of precision and recall, is relatively high as well. In this case, a high F1 score indicates that the model achieves a decently good balance between correctly identifying fraudulent emails (recall) and avoiding false positives (precision).

However, there is a considerable number of false negatives (fraud emails not detected). As a result, the **Recall** is marginally lower as compared to **Accuracy** and **Precision**. At the same time, the **F2 Score**, which weighs recall higher than precision, is very low. This suggests that there is room for improvement in capturing more of the actual fraudulent emails. This is especially important given the fact that undetected fraud emails may be very costly to the user.

Upon closer examination, it is noticed that fraud emails which are milder, less aggressive  are more likely undetected with the given prompt, which generally focus more on fraud emails that are more direct and detrimental, such as those demanding a direct transfer of money. 

An exmaple of an undetected fraud email is:
```
Sender: Customer Service <info@lotoftees.com>
Receiver: jose@monkey.org
Date: Wed, 16 Nov 2022 05:39:49 +0000 (UTC)
Subject: 
Netflix : We're having some trouble with your current billing information
Body: 
NETFLIX Dear jose@monkey.org, We're having some trouble 
 with your current billing information. We'll try again, but in 
 the meantime you may want to update your payment details.. 
 We'll try again, but in the meantime you may want to update 
 your payment details. click on the button bellow to update your 
 account now. >>Update  my Account Thank you for choosing 
 netflix. Netflix billing team.
```
Therefore, our future work will focus on lowering the number of false negatives by correctly identifying more of these milder fraud emails. This could include experimenting with different prompts, exploring additional datasets, as well as more rigorous testing.
