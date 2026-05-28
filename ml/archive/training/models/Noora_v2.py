import tensorflow as tf
import pandas as pd
import numpy as np
import tensorflow_addons as tfa

from sklearn.model_selection import train_test_split

# Loading the Data after being preprocessed and merging them into one big data

data = pd.read_csv(r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\Go_Emotions\cleaned\cleaned_data.csv")

# Labels
labels = ["admiration", "amusement", "anger", "annoyance", "approval", "caring",
          "confusion", "curiosity", "desire", "disappointment", "disapproval",
          "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
          "joy", "love", "nervousness", "optimism", "pride", "realization", "relief",
          "remorse", "sadness", "surprise", "neutral"]


# Convert label columns to numeric ("0" and "1" to 0 and 1) and clean data
data[labels] = data[labels].apply(pd.to_numeric, errors='coerce')
data.dropna(subset=labels, inplace=True)

data['text'] = data['text'].fillna('').astype(str)  # Making all texts of type string

X = data['text']
y = data[labels]

# Vocabulary

unique = set()
texts = data['text']

for text in texts:
    words = tf.keras.preprocessing.text.text_to_word_sequence(text)
    for word in words:
        unique.add(word)

vocabulary = {word: index+1 for index, word in enumerate(unique)}
vocabulary_size = len(vocabulary) + 1  # add 1 for padding token (0)


# Encoding Function
MAX_LEN = 150   # Using the max_number_of_words algorithm the MAX_LEN for a text in data is 142 so we choose 150

def encode(input):
    tokens = tf.keras.preprocessing.text.text_to_word_sequence(input)   # Transforming sequences to words
    tokens = [vocabulary[word] if word in vocabulary else 0 for word in tokens] # Replacing words with their values if existing in our vocab else make it 0

    return tf.keras.preprocessing.sequence.pad_sequences([tokens], maxlen=MAX_LEN)[0]

if __name__ == "__main__":

    # Encode the Data
    X_encoded = []

    for text in X:
        X_encoded.append(encode(text))

    # Splitting the Data

    data[labels] = data[labels].apply(pd.to_numeric, errors='coerce')   # Convert all label values to numeric (force conversion)

    X_encoded = np.array(X_encoded, dtype=np.int32)
    y = np.array(y, dtype=np.float32)   # float32 matching the models output (sigmoid)

    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, train_size=0.8, test_size=0.2, random_state=42, shuffle=True)

    print("Max token index in X_encoded:", np.max(X_encoded))
    print("Vocabulary size:", vocabulary_size)

    # Create an Embedding layer using FastText pre-trained Embeddings
    Embedding_Matrix = np.load("/content/drive/MyDrive/Colab Notebooks/Clean_Embedding_Matrix.npy")

    Embedding_Layer = tf.keras.layers.Embedding(input_dim=vocabulary_size, output_dim=300, weights=[Embedding_Matrix], input_length=MAX_LEN, trainable=False)

    # Checkpoints and Early saving for the best model while training + Reducing learning rate
    checkpoint = tf.keras.callbacks.ModelCheckpoint(filepath="Calmotion_v2_Best.keras",
                                                    monitor='val_f1_score',
                                                    save_best_only=True,
                                                    save_weights_only=False,    # weights and architecture
                                                    mode='max', # For max val_f1_score
                                                    verbose=1)

    stop_training = tf.keras.callbacks.EarlyStopping(monitor='val_f1_score', patience=5, mode='max', verbose=1, restore_best_weights=True)

    reduce_lrate = tf.keras.callbacks.ReduceLROnPlateau(monitor='val_f1_score', factor=0.2,patience=2, verbose=1, mode='max')

    # The Model
    inputs = tf.keras.layers.Input(shape=(MAX_LEN,))
    x = tf.keras.layers.Embedding(input_dim=vocabulary_size, output_dim=300, weights=[Embedding_Matrix], input_length=MAX_LEN, trainable=False)(inputs)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(256, return_sequences=True))(x)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(128, return_sequences=True))(x)
    x = tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=True))(x)
    x = tf.keras.layers.Attention()([x,x])
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.LayerNormalization()(x)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(64, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(28, activation='sigmoid')(x)

    model = tf.keras.Model(inputs, outputs)

    print("Starting compiling the Model:\n")
    model.compile(optimizer=tf.keras.optimizers.AdamW(learning_rate=2e-4, weight_decay=1e-5), loss=tf.keras.losses.CategoricalFocalCrossentropy(gamma=2.0, alpha=0.25, from_logits=False), metrics=[tfa.metrics.F1Score(num_classes=28, average='micro', threshold=0.5)])
    print("✅ Compiling done!\n")

    print("Starting training the Model:\n")
    training_history = model.fit(X_train, y_train, epochs=4, batch_size=32, validation_split=0.2, callbacks=[checkpoint, stop_training, reduce_lrate])
    print("✅ Finished the 4 epochs!\n")

    Embedding_Layer.trainable = True

    print("Recompiling the Model:\n")
    model.compile(optimizer=tf.keras.optimizers.AdamW(learning_rate=1e-4, weight_decay=1e-4), loss=tf.keras.losses.CategoricalFocalCrossentropy(gamma=2.0, alpha=0.25, from_logits=False), metrics=[tfa.metrics.F1Score(num_classes=28, average='micro', threshold=0.5)])
    print("✅ ReCompiling done!\n")

    training_history_2 = model.fit(X_train, y_train, initial_epoch=4, epochs=50, batch_size=32, validation_split=0.2, callbacks=[checkpoint, stop_training, reduce_lrate])
    print("✅ Training done!\n")

    # Save the Model after training it
    model.save('Calmotion_v2.keras')
    print("✅ Model saved.")
