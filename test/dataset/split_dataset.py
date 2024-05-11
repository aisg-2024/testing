import pandas as pd

df = pd.read_excel('dataset_test.xlsx')

entries_per_sheet = 50
phishing_emails = df[df['label'] == 1]
non_phishing_emails = df[df['label'] == 0]

# Iterate and create Excel sheets
for i in range(20):
    # Select the rows for the current iteration
    start_idx = i * entries_per_sheet
    end_idx = start_idx + entries_per_sheet
    
    # Combine phishing and non-phishing emails
    combined_df = pd.concat([phishing_emails[start_idx:end_idx], non_phishing_emails[start_idx:end_idx]])
    
    # Create Excel writer
    # writer = pd.ExcelWriter(f'C:\\Users\\GX\\Desktop\\NUS\\Y2S2\\AISG_CSIT\\dataset\\dataset_test{i+1}.xlsx')
    writer = pd.ExcelWriter(f'dataset_test{i+1}.xlsx')
    
    # Write DataFrame to Excel
    combined_df.to_excel(writer, index=False)
    
    # Save the Excel file
    writer.close()
