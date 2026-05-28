import tensorflow as tf
import numpy as np

from archive.training.models.Noora_v5 import encode, labels
from archive.training.model_utils.F1Score import F1Score
from archive.training.model_utils.MultiLabelF1Score import MultiLabelF1Score
from archive.training.model_utils.Bert_Embeddings import get_embeddings

model = tf.keras.models.load_model(r"C:\Users\Elio\Desktop\Empathara\Noora\Saved_Models\Noora_v6.keras", custom_objects={"F1Score": F1Score})

def predict(input_text):
    embeddings = get_embeddings(input_text)
    prediction = model.predict(embeddings)
    return prediction[0]

def print_results(input, prediction):
    print(f'Input: {input} \n')
    top_three_indices = np.argsort(prediction)[-3:][::-1]
    for index in top_three_indices:
        print(f'- Emotion: {labels[index]} ~ {prediction[index]}')

sentences = [
    "I’m so happy to see you again!",
    "This made my entire day better.",
    "I love how thoughtful you are.",
    "She smiled as the sun rose over the mountains.",

    "I don’t think I can handle this anymore.",
    "He walked away without saying goodbye.",
    "It hurts, but I understand.",
    "That news broke my heart.",

    "I can’t believe they did that to me.",
    "You never listen to what I’m saying!",
    "This is so unfair and infuriating!",
    "I’m done being treated like this.",

    "What if everything goes wrong?",
    "I’m terrified of what might happen next.",
    "I don’t feel safe anymore.",
    "My hands won’t stop shaking.",

    "Wait—what just happened?!",
    "I did not expect that at all.",
    "You got me tickets to the concert?!",
    "That was the most incredible thing I’ve ever seen.",

    "It’s just another day, really.",
    "I'm not sure how I feel about that.",
    "Could go either way, I guess.",
    "Okay. Not great, not terrible."
]

user_samples = [
    # Sadness / Grief / Hurt
    "I just feel really empty lately.",
    "It’s been hard to get out of bed these days.",
    "I miss them more than I can explain.",
    "Everything feels heavy and pointless.",
    "It hurts, but I’m trying to move on.",

    # Anger / Frustration
    "I’m so done with people walking all over me.",
    "Why does no one ever listen?",
    "This is beyond unfair.",
    "I’ve had enough of being treated like this.",
    "I'm trying to stay calm, but it's not easy.",

    # Anxiety / Fear / Stress
    "I’m scared something bad is going to happen.",
    "My mind won’t stop racing.",
    "What if I’m not good enough?",
    "I can't breathe when I think about it.",
    "Everything feels out of control.",

    # Disappointment / Regret
    "I really thought this time would be different.",
    "I let myself down again.",
    "Maybe I should’ve just kept quiet.",
    "It didn’t go the way I hoped.",
    "I hate that I still care.",

    # Happiness / Joy / Excitement
    "I feel like I'm finally where I belong.",
    "Today was just... amazing.",
    "I can’t stop smiling right now!",
    "I’m actually excited about the future.",
    "Everything is falling into place.",

    # Love / Affection / Gratitude
    "I’m so lucky to have you in my life.",
    "You mean the world to me.",
    "Thank you for being there for me.",
    "I’ve never felt this connected to someone.",
    "Just knowing you care makes all the difference.",

    # Uncertainty / Confusion / Numbness
    "I don’t even know what I’m feeling anymore.",
    "I’m kind of numb to it all now.",
    "I’m not sure what I’m supposed to do.",
    "Everything feels... weird.",
    "It’s like I’m stuck in my own head."
    ]

sample_inputs = [
    "I just want today to be over already.",
    "It’s like nobody really sees me.",
    "I’m not okay, but I don’t know how to explain it.",
    "Sometimes I feel everything all at once, and other times, nothing.",
    "Why does it always end up like this?",
    "I don’t even know if I’m sad or just tired.",
    "Trying to smile through it, but it’s getting harder.",
    "They said it would get easier. It hasn’t.",
    "I’m happy for them, but it still hurts.",
    "It’s not anger, it’s more like disappointment that keeps growing.",
    "I'm doing better than before, I think.",
    "I'm grateful for the little things lately.",
    "Honestly, I’m scared to hope again.",
    "It’s weird how numb I feel right now.",
    "I know I should move on, but I’m stuck.",
    "This time, I really thought it would work out.",
    "Not sure if I’m healing or just pretending.",
    "Even the things I used to love feel heavy now.",
    "Some days are okay. Others feel impossible.",
    "I’m learning to be okay with not being okay."
]

sentence = ["today I got promoted at work, I cannot express how I am feeling."]

for sentence in sentences:
    prediction = predict(sentence)
    print_results(sentence, prediction)
