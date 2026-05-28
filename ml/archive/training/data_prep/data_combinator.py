import glob
import pandas as pd

start, end = 49000, 56000
path = r"C:\Users\Elio\Desktop\Empathara\Noora\Data\Go_Emotions\final_200k\final_8.csv"

final_texts = []

for file in glob.glob(r"C:\Users\Elio\Desktop\Empathara\Noora\Data\Go_Emotions\augmented\*.csv"):
    data = pd.read_csv(file)
    texts = data.iloc[start:end]
    final_texts.append(texts)

df = pd.concat(final_texts, ignore_index=True)
shuffled = df.sample(frac=1, random_state=42).reset_index(drop=True)
shuffled.to_csv(path)

