import tensorflow as tf
import pandas as pd

# Loading the Data after being preprocessed and merging them into one big data
data_1 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_1.csv')
data_2 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_2.csv')
data_3 = pd.read_csv('C:/Users/Elio/Desktop/Calmi~Calmy/Calmi/Data/Go_Emotions/goemotions_3.csv')

data = pd.concat([data_1, data_2, data_3], ignore_index=True)

texts = data['text']

tokenizer = tf.keras.preprocessing.text.Tokenizer()
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)

max_tokens = max(len(seq) for seq in sequences)
print("Max number of tokens:", max_tokens)
