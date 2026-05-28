import tensorflow as tf
import pandas as pd
import numpy as np
import tensorflow_addons as tfa
import torch

from sklearn.model_selection import train_test_split
from transformers import BertTokenizer
from transformers import BertTokenizer, BertModel

# Loading the Data

data = pd.read_csv(r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\final\Final_Data.csv")

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

# BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Encoding Function

MAX_LEN = 150   # Using the max_number_of_words algorithm the MAX_LEN for a text in data is 142 so we choose 150

def encode(input):
    if isinstance(input, str):
        input = input.lower()
    else:
        input = [text.lower() for text in input]
    encoded = tokenizer(input, padding='max_length', truncation=True, return_tensors='pt', max_length=MAX_LEN)
    
    return encoded 

# Bert Embeddings
bert_model = BertModel.from_pretrained("bert-base-uncased").to('cuda')
bert_model.eval()
    
def get_embeddings(input, max_len=MAX_LEN):
    tokens_ids = encode(input)
    tokens_ids = {k: v.to("cuda") for k, v in tokens_ids.items()}

    with torch.no_grad():
        outputs = bert_model(**tokens_ids)
        last_hidden_state = outputs.last_hidden_state  # shape: (1, seq_len, 768)

    return last_hidden_state.cpu().numpy()

if __name__ == "__main__":

    # Splitting the Data
    data[labels] = data[labels].apply(pd.to_numeric, errors='coerce')   # Convert all label values to numeric (force conversion)

    y = np.array(y, dtype=np.float32)   # float32 matching the models output (sigmoid)

    X_train, X_test, y_train, y_test = train_test_split(X, y, train_size=0.8, test_size=0.2, random_state=42, shuffle=True)


    # Bert Embeddings - making batches for memory efficiency
    batch_size = 64

    train_embedding_matrix = []
    test_embedding_matrix = []

    for i in range(0, len(X_train), batch_size):  # Loops over the data from 0 to len(X) in steps = batch_size
        batch = X_train[i:i+batch_size].tolist()
        embeddings = get_embeddings(batch, MAX_LEN)
        train_embedding_matrix.append(embeddings)

    for i in range(0, len(X_test), batch_size):  # Loops over the data from 0 to len(X) in steps = batch_size
        batch = X_test[i:i+batch_size].tolist()
        embeddings = get_embeddings(batch, MAX_LEN)
        test_embedding_matrix.append(embeddings)

    train_embedding_matrix = np.vstack(train_embedding_matrix)
    test_embedding_matrix = np.vstack(test_embedding_matrix)

    # Checkpoints and Early saving for the best model while training + Reducing learning rate
    checkpoint = tf.keras.callbacks.ModelCheckpoint(filepath="Calmotion_v4_Best.keras",
                                                    monitor='val_f1_score',
                                                    save_best_only=True,
                                                    save_weights_only=False,    # weights and architecture
                                                    mode='max', # For max val_f1_score
                                                    verbose=1)

    stop_training = tf.keras.callbacks.EarlyStopping(monitor='val_f1_score', patience=5, mode='max', verbose=1, restore_best_weights=True)

    reduce_lrate = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_f1_score', factor=0.2, patience=2, verbose=1, mode='max')

    # The Model

    inputs = tf.keras.layers.Input(shape=(768,))
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True, kernel_regularizer=tf.keras.regularizers.l2(1e-4)))(inputs)
    residual = x
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True, kernel_regularizer=tf.keras.regularizers.l2(1e-4)))(x)
    x = tf.keras.layers.Add()([x, residual])
    x = tf.keras.layers.LayerNormalization()(x)
    residual = x
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True, kernel_regularizer=tf.keras.regularizers.l2(1e-4)))(x)
    x = tf.keras.layers.Add()([x, residual])
    x = tf.keras.layers.LayerNormalization()(x)
    residual = x
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True, kernel_regularizer=tf.keras.regularizers.l2(1e-4)))(x)
    x = tf.keras.layers.Add()([x, residual])
    x = tf.keras.layers.LayerNormalization()(x)
    x = tf.keras.layers.Dense(128, activation=tf.keras.activations.gelu, kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = tf.keras.layers.MultiHeadAttention(num_heads=8, key_dim=32)(x,x)
    x = tf.keras.layers.LayerNormalization()(x)
    x1 = tf.keras.layers.GlobalMaxPool1D()(x)
    x2 = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Concatenate()([x1,x2])
    x = tf.keras.layers.Dense(64, activation=tf.keras.activations.gelu, kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = tf.keras.layers.Dropout(0.2, name='dropout_1')(x)
    x = tf.keras.layers.Dense(64, activation=tf.keras.activations.gelu, kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = tf.keras.layers.Dropout(0.3, name='dropout_2')(x)
    x = tf.keras.layers.Dense(32, activation=tf.keras.activations.gelu, kernel_regularizer=tf.keras.regularizers.l2(1e-4))(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Activation(tf.keras.activations.gelu)(x)
    x = tf.keras.layers.Dropout(0.35, name='dropout_3')(x)
    outputs = tf.keras.layers.Dense(28, activation='sigmoid')(x)

    model = tf.keras.Model(inputs, outputs)

    print("Compiling the Model:\n")
    model.compile(optimizer=tf.keras.optimizers.AdamW(learning_rate=1e-4, weight_decay=1e-4), loss=tf.keras.losses.BinaryCrossentropy(from_logits=False), metrics=tfa.metrics.F1Score(num_classes=28, average='micro', threshold=0.5))
    print("✅ Compiling done!\n")

    training_history = model.fit(train_embedding_matrix, y_train, epochs=50, batch_size=32, validation_split=0.2, callbacks=[checkpoint, stop_training, reduce_lrate])
    print("✅ Training done!\n")



#NOTE: This Model's architecture is not ideal with 200k of Bert Embeddings or 1.6 million texts with Fasttext Embeddings. It might have a chance with 1.6million Bert Embeddings.
