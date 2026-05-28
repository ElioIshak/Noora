##NOTE: FROM FASTTEXT ORIGINAL WEBSITE

import io
import numpy as np

import io
import numpy as np

def load_vectors(fname, verbose_every=100000, max_vectors=None, print_each=False):
    fin = io.open(fname, 'r', encoding='utf-8', newline='\n', errors='ignore')
    n, d = map(int, fin.readline().split())  # header: "2000000 300"
    print(f"🔎 Header: {n:,} words, {d} dimensions\n")

    data = {}
    for index, line in enumerate(fin, 1):
        tokens = line.rstrip().split(' ')
        if len(tokens) != d + 1:
            continue  # skip bad lines

        word = tokens[0]
        try:
            vector = np.array(tokens[1:], dtype=np.float32)
            data[word] = vector
        except ValueError:
            continue  # skip bad floats

        if print_each:
            print(f"📥 Loading vector {index}: {word}")
        elif verbose_every and index % verbose_every == 0:
            print(f"✅ Loaded {index:,} vectors...")

        if max_vectors and index >= max_vectors:
            break

    print(f"\n✅ Done. Total loaded: {len(data):,} vectors.")
    return data


def embedding_matrix(vocabulary, fast_text_embeddings, embedding_dim=300):
    embedding_matrix = np.zeros((len(vocabulary)+1, 300))
    for word, index in vocabulary.items():
        print(f"Getting the Embedding of Word {word} : {index}")
        vector = fast_text_embeddings.get(word)
        if vector is not None:
            embedding_matrix[index] = vector
        else:
            embedding_matrix[index] = np.random.normal(scale=0.6, size=(embedding_dim,))

    return embedding_matrix

# Create an Embedding matrix using FastText pre-trained Embeddings

file_name = r"C:\Users\Elio\Desktop\Calmi~Calmy\Calmi\Data\crawl-300d-2M.vec"
Embeddings = load_vectors(file_name)
Embedding_Matrix = embedding_matrix(vocabulary, Embeddings)

np.save('Embedding_Matrix.npy', Embedding_Matrix)
