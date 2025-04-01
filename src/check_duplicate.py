import pandas as pd

# Load CSV file
file_path = "/Users/guyivanocon/Desktop/NeuReview/UPCaiT/Data/question_bank_tags/filipino_lang_prof_v1.csv"  # Change this to your CSV file's path
df = pd.read_csv(file_path)

# Check for duplicate IDs
duplicates = df[df.duplicated(subset=['question_id'], keep=False)]

# Display duplicate rows
if not duplicates.empty:
    print("Duplicate question_id values found:")
    print(duplicates)
else:
    print("No duplicate IDs found.")