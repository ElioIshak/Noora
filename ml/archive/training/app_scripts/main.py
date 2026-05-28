import torch
import numpy as np
import tensorflow as tf

from transformers import AutoModel
from archive.training.model_utils.Prompt_Engine import (
    generate_prompt,
    check_complex_emotions,
    rules_generator,
    labels,
)
from archive.training.model_utils.Bert_Embeddings import get_embeddings
from archive.training.model_utils.F1Score import F1Score
from archive.training.response_generator.Noora_response_generator import Noora_response

def predict(input):

    model = tf.keras.models.load_model("model/Noora_v6.keras", custom_objects={"F1Score": F1Score})

    embeddings = get_embeddings(input)
    prediction = model.predict(embeddings)
    return prediction[0]

def run_pipeline(input, user):
    prediction = predict(input)

    top_three_indices = np.argsort(prediction)[-3:][::-1] # Get the indices of the top 3 largest values in descending order
    top_three_emotions = []

    for index in top_three_indices:
        top_three_emotions.append(labels[index])
 
    complex_emotion = check_complex_emotions(prediction)
    prompt = generate_prompt(user, input, prediction, complex_emotion)
    response = Noora_response(prompt)

    return {
        'emotions': top_three_emotions,
        'complex_emotion': complex_emotion,
        'response': response
    }

