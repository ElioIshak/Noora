import pandas as pd
import re

data_1 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_1.csv')
data_2 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_2.csv')
data_3 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_3.csv')

data = pd.concat([data_1, data_2, data_3], ignore_index=True)

def clean_placeholders(text):
    # Remove unwanted quotations and extra spaces
    text = re.sub(r'\".*?\"', '', text)  # Remove "like this"
    text = re.sub(r'\*.*?\*', '', text)  # Remove *like this*
    
    # Replace specific placeholders with a generic word (e.g., [NAME] becomes PERSON)
    text = re.sub(r'\[NAME\]', 'PERSON', text)
    text = re.sub(r'\[RELIGION\]', 'GROUP', text)
    text = re.sub(r'\"\"', '', text)  # Remove empty quotes
    text = re.sub(r'\/jk|\\jk', '', text)  # Remove jokes or channel identifiers
    text = re.sub(r'\[.*?\]', 'PLACEHOLDER', text)  # Replace anything in square brackets with 'PLACEHOLDER'

    # Handle emojis (remove or replace them with "EMOJI" token)
    text = re.sub(r'[^\w\s,]', ' ', text)  # Remove non-word characters (emojis and punctuation)
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = text.strip()  # Remove leading/trailing spaces

    return text

data['text'] = data['text'].apply(clean_placeholders)


data.to_csv('cleaned_data.csv', index=False)

print("✅ Data cleaned and saved to 'cleaned_data.csv'")

cleaned_data = pd.read_csv(r"C:\Users\Elio\Desktop\Calmi~Calmy\cleaned_data.csv")
print(cleaned_data.head)
