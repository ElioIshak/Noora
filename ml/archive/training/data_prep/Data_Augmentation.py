# ------------------------------------------
# The following data augmentation code was generated with the assistance of GPT (a tool by OpenAI).
# The code was used to expedite the process, and it is not a core part of the project.
# It was generated for the purpose of improving dataset quality and reducing manual effort.
# I take no credit for the actual implementation of this specific code.
# ------------------------------------------

import nlpaug.augmenter.word as naw
import pandas as pd
import nltk
from collections import defaultdict
import random
import os

# 🧠 Download NLTK resources
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

# 🗂️ Define paths
data_path = r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\cleaned\cleaned_data.csv"  # ⬅️ change if your file is in a different folder
output_dir = r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\augmented"
os.makedirs(output_dir, exist_ok=True)

# 🧠 BERT-based word augmenter
aug = naw.ContextualWordEmbsAug(model_path='bert-base-uncased', action='substitute')

# 😃 Emotion labels
labels = ["disapproval",
          "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
          "joy", "love", "nervousness", "optimism", "pride", "realization", "relief",
          "remorse", "sadness", "surprise", "neutral"]

TARGET_COUNT = 60000  # 🧮 Desired samples per emotion

# 🔢 Load dataset
df = pd.read_csv(data_path)
df[labels] = df[labels].apply(pd.to_numeric, errors='coerce').fillna(0).astype(int)

df = df[df['text'].notna()]
df['text'] = df['text'].astype(str).str.strip()
df = df[df['text'] != ""]  # Remove empty strings

# 📊 Count current labels
def get_label_counts(df, labels):
    return {label: df[label].sum() for label in labels}

# 🚀 Main function
def augment_data_to_balance(df, labels, target_count=60000, output_dir="augmented_emotions"):
    label_counts = get_label_counts(df, labels)
    label_to_rows = defaultdict(list)

    # Build lookup for each label
    for _, row in df.iterrows():
        for label in labels:
            if row[label] == 1:
                label_to_rows[label].append(row)

    for label in labels:
        current_count = label_counts[label]
        needed = target_count - current_count

        print(f"\n🔧 Label: {label} | Current: {current_count} | Needed: {needed}")
        if needed <= 0:
            continue

        source_rows = label_to_rows[label]
        if not source_rows:
            print(f"⚠️ No samples for label '{label}', skipping.")
            continue

        augmentations_done = 0
        label_augmented_data = []

        while augmentations_done < needed:
            row = random.choice(source_rows)
            original_text = row['text']
            original_labels = row[labels].values.tolist()

            try:
                augmented_text = aug.augment(original_text)
                if isinstance(augmented_text, list):
                    augmented_text = ' '.join(augmented_text)
            except Exception as e:
                print(f"⚠️ Augmentation failed: {original_text[:50]}... | Error: {e}")
                continue

            label_augmented_data.append([augmented_text] + original_labels)
            augmentations_done += 1

            if augmentations_done % 1000 == 0:
                print(f"  ✅ {augmentations_done}/{needed} done for '{label}'")

        # Save per-label CSV
        label_df = pd.DataFrame(label_augmented_data, columns=["text"] + labels)
        filename = os.path.join(output_dir, f"augmented_{label}_to_{target_count}.csv")
        label_df.to_csv(filename, index=False)
        print(f"💾 Saved: {filename}")

    print("\n✅ All labels processed.")

# 🚀 Run the augmentation
augment_data_to_balance(df, labels, target_count=TARGET_COUNT, output_dir=output_dir)
