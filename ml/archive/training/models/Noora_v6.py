# NOTE: This Model (v6) is actually the v5 but with some modifications. Trained with BERT Embeddings - emotion -  and the 200k dataset ONLY.

## Metrics Explanation:
# 1. AUC (Area Under Curve): Measures the ability of the model to distinguish between classes. Higher is better (max = 1.0).
# 2. Binary Accuracy: Fraction of predictions the model got right. Can be misleading in imbalanced datasets.
# 3. F1 Score: Harmonic mean of precision and recall. Balances false positives and false negatives.
# 4. Loss: The optimization objective. Lower is better.
# 5. Precision: Of all predicted positives, how many are correct. High precision means few false positives.
# 6. Recall: Of all actual positives, how many were predicted correctly. High recall means few false negatives.

import tensorflow as tf
import pandas as pd
import numpy as np
import torch

from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer, AutoModel
from archive.training.model_utils.Bert_Embeddings import get_embeddings
from archive.training.model_utils.Batch_Generator import batch_generator
from archive.training.model_utils.F1Score import F1Score
from archive.training.model_utils.MultiLabelF1Score import MultiLabelF1Score

# Loading the Data

data = pd.read_csv("/content/drive/MyDrive/CONSTRUCTION/final_200k_texts.csv")

# Labels
labels = ["admiration", "amusement", "anger", "annoyance", "approval", "caring",
          "confusion", "curiosity", "desire", "disappointment", "disapproval",
          "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
          "joy", "love", "nervousness", "optimism", "pride", "realization", "relief",
          "remorse", "sadness", "surprise", "neutral"]


# Convert label columns to numeric ("0" and "1" to 0 and 1) and clean data
data[labels] = data[labels].apply(pd.to_numeric, errors='coerce')
data.dropna(subset=labels, inplace=True)

data['text'] = data['text'].fillna('').astype(str).str.lower()  # Making all texts of type string

X = data['text']
y = data[labels]

# Tokenizer
tokenizer = AutoTokenizer.from_pretrained("bhadresh-savani/bert-base-go-emotion")

# Encoding Function

MAX_LEN = 150   # Using the max_number_of_words algorithm the MAX_LEN for a text in data is 142 so we choose 150

def encode(input):

    encoded = tokenizer(input, padding='max_length', truncation=True, return_tensors='pt', max_length=MAX_LEN)
    return encoded


# Splitting the Data
data[labels] = data[labels].apply(pd.to_numeric, errors='coerce')   # Convert all label values to numeric (force conversion)
y = np.array(y, dtype=np.float32)   # float32 matching the models output (sigmoid)
X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.8, test_size=0.2, random_state=42, shuffle=True)

# Bert Embeddings - making batches for memory efficiency
batch_size = 64
count = 0

print("Starting with Training Embeddings:\n")

for i in range(0, len(X_train), batch_size):  # Loops over the data from 0 to len(X) in steps = batch_size
    batch = X_train[i:i+batch_size].tolist()
    embeddings = get_embeddings(batch, MAX_LEN)
    np.save(f"/content/Training_Embeddings_200k/train_embeddings_{count+1}.npy", embeddings)
    print(f"Done with batch: {count+1}")
    count += 1

print("Done with the training embeddings!\n")

print("Starting with Training labels:\n")
count = 0

for i in range(0, len(y_train), batch_size):
    batch = y_train[i:i+batch_size]
    filename = f"/content/Training_Labels_200k/train_labels_{count+1}.npy"
    np.save(filename, batch)
    print(f"✅ Saved label batch {count+1}: {filename}")
    count += 1

print("Starting with Val Embeddings:\n")

for i in range(0, len(X_train), batch_size):  # Loops over the data from 0 to len(X) in steps = batch_size
    batch = X_train[i:i+batch_size].tolist()
    embeddings = get_embeddings(batch, MAX_LEN)
    np.save(f"/content/Val_Embeddings_200k/val_embeddings_{count+1}.npy", embeddings)
    print(f"Done with batch: {count+1}")
    count += 1

print("Done with the val embeddings!\n")

print("Starting with val labels:\n")
count = 0

for i in range(0, len(y_train), batch_size):
    batch = y_train[i:i+batch_size]
    filename = f"/content/Val_Labels_200k/val_labels_{count+1}.npy"
    np.save(filename, batch)
    print(f"✅ Saved label batch {count+1}: {filename}")
    count += 1

# Getting the Data for Training and Validation using a generator
training_data_gen = tf.data.Dataset.from_generator(lambda: batch_generator("/content/Training_Embeddings_200k","/content/Training_Labels_200k"),
                                                   output_signature=(tf.TensorSpec(shape=(None, MAX_LEN, 768), dtype=tf.float32), tf.TensorSpec(shape=(None, 28), dtype=tf.float32))
                                                   ).prefetch(tf.data.AUTOTUNE) # It allows data loading and model training to happen in parallel

val_data_gen = tf.data.Dataset.from_generator(lambda: batch_generator("/content/Val_Embeddings", "/content/Val_Labels"),
                                              output_signature=(tf.TensorSpec(shape=(None, MAX_LEN, 768), dtype=tf.float32), tf.TensorSpec(shape=(None, 28), dtype=tf.float32))
                                             ).prefetch(tf.data.AUTOTUNE)

MAX_LEN = 150

# Checkpoints and Early saving for the best model while training + Reducing learning rate
checkpoint_normal = tf.keras.callbacks.ModelCheckpoint(filepath="Noora_v6_Best_normal.keras",
                                                    monitor='val_f1_score',
                                                    save_best_only=True,
                                                    save_weights_only=False,    # weights and architecture
                                                    mode='max', # For max val_f1_score
                                                    verbose=1)
    
checkpoint_macro = tf.keras.callbacks.ModelCheckpoint(filepath="Noora_v6_Best_macro.keras",
                                                    monitor='val_f1_score_macro',
                                                    save_best_only=True,
                                                    save_weights_only=False,    # weights and architecture
                                                    mode='max', # For max val_f1_score
                                                    verbose=1)

stop_training = tf.keras.callbacks.EarlyStopping(monitor='val_f1_score_macro', patience=5, mode='max', verbose=1, restore_best_weights=True)

reduce_lrate = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_f1_score_macro', factor=0.2, patience=2, verbose=1, mode='max')

## The Model's Architecture

# Input shape matches BERT embedding (not token indices!)
inputs = tf.keras.Input(shape=(MAX_LEN, 768), dtype=tf.float32)

# BiLSTM Stack (same as before)
x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(256, return_sequences=True))(inputs)
x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True))(x)
x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=True))(x)

# Multi-Head Attention
x = tf.keras.layers.MultiHeadAttention(num_heads=4, key_dim=32)(x, x)

# Regularization
x = tf.keras.layers.Dropout(0.3)(x)
x = tf.keras.layers.LayerNormalization()(x)

# Dense Feature Layer
x = tf.keras.layers.Dense(128, activation='relu')(x)

# Dual Pooling
x1 = tf.keras.layers.GlobalMaxPooling1D()(x)
x2 = tf.keras.layers.GlobalAveragePooling1D()(x)
x = tf.keras.layers.Concatenate()([x1, x2])

x = tf.keras.layers.Dense(64, activation='relu')(x)
x = tf.keras.layers.Dropout(0.3)(x)

# Output Layer
outputs = tf.keras.layers.Dense(28, activation='sigmoid')(x)

# Final Model
model = tf.keras.Model(inputs, outputs)

## Compiling and Training
model.compile(optimizer=tf.keras.optimizers.AdamW(learning_rate=1e-4, weight_decay=1e-3), loss=tf.keras.losses.BinaryCrossentropy(from_logits=False),
              metrics=[F1Score(),
                       tf.keras.metrics.BinaryAccuracy(threshold=0.5),
                       tf.keras.metrics.Precision(thresholds=0.5),
                       tf.keras.metrics.Recall(thresholds=0.5),
                       tf.keras.metrics.AUC(multi_label=True, num_labels=28),
                       MultiLabelF1Score(num_labels=28, name="f1_score_macro")])

print("✅ Compiling done!\n")

# steps_per_epoch = number of files for training ; validation_steps = number of files for validation
training_history = model.fit(training_data_gen, epochs=5, steps_per_epoch=1707, validation_data=val_data_gen, validation_steps=301,callbacks=[checkpoint_normal, checkpoint_macro, stop_training, reduce_lrate])
print("✅ Training done!\n")
