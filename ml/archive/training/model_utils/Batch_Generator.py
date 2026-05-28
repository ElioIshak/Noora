import os
import numpy as np
import random

# Generator that yields (X, y) batches from .npy files (each file is a batch of embeddings) in given directories.

def batch_generator(embedding_dir, label_dir):

    embed_files = sorted(os.listdir(embedding_dir))
    label_files = sorted(os.listdir(label_dir))

    while True:
        for embed_file, label_file in zip(embed_files, label_files):
            X = np.load(os.path.join(embedding_dir, embed_file))
            y = np.load(os.path.join(label_dir, label_file))
            yield X, y

