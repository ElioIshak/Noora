import pandas as pd
import pickle as pk

## Complex Emotions Builder

labels = ["admiration", "amusement", "anger", "annoyance", "approval", "caring",
          "confusion", "curiosity", "desire", "disappointment", "disapproval",
          "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
          "joy", "love", "nervousness", "optimism", "pride", "realization", "relief",
          "remorse", "sadness", "surprise", "neutral"]

emotions_combinations = [[]]
resulting_emotions = []

complex_emotions = pd.read_excel(r"C:\Users\Elio\Desktop\Empathara\Noora\data\complex_emotions.xlsx")

emotions = complex_emotions['Complex Emotion']
combinations = complex_emotions['Combination of Basic Emotions']

for index, row in complex_emotions.iterrows():
    resulting_emotions.append(emotions[index])
    val = combinations[index]
    if isinstance(val, str):
        combos = val.split(' + ')
    else:
        combos = str(val).split(' + ').low()
    emotions_combinations.append(combos)

with open("complex_emotions.pkl", "wb") as f:
    pk.dump((resulting_emotions, emotions_combinations), f)

