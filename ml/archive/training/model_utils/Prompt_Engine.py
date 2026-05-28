# import complex emotion (pkl) from Data folder
from matplotlib.pylab import argmax
import numpy as np
import pickle

labels = ["admiration", "amusement", "anger", "annoyance", "approval", "caring",
          "confusion", "curiosity", "desire", "disappointment", "disapproval",
          "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
          "joy", "love", "nervousness", "optimism", "pride", "realization", "relief",
          "remorse", "sadness", "surprise", "neutral"]


### Prompt Template

## Complex Emotion Checker
with open('complex_emotions.pkl', 'rb') as f:
    data = pickle.load(f)
    combinations = data['combinations']
    res_emotions = data['resulting_emotions']

def check_complex_emotions(emotions, combinations=combinations, resulting_emotions=res_emotions):
    top_three_indices = np.argsort(emotions)[-3:][::-1] # Get the indices of the top 3 largest values in descending order
    top_three_emotions = []

    for index in top_three_indices:
        top_three_emotions.append(labels[index])

    if top_three_emotions in combinations:
        complex_emo = resulting_emotions[combinations.index(top_three_emotions)]

    if 'joy' in top_three_emotions and 'sadness' in top_three_emotions: complex_emo = 'bittersweet'
    elif 'disgust' in top_three_emotions and 'anger' in top_three_emotions: complex_emo = 'envy'
    elif 'optism' in top_three_emotions and 'joy' in top_three_emotions: complex_emo = 'hope'

    return complex_emo

## Rules Function
def rules_generator(emotions, complex_emotion=None):
    top_three_indices = np.argsort(emotions)[-3:][::-1] # Get the indices of the top 3 largest values in descending order
    rules = []

    if complex_emotion is None:
        for index in top_three_indices:
            if emotions[index]>=0.3:
                emotion = labels[index]

            if emotion == 'admiration':
                rules.append("The user may be experiencing admiration or inspiration.")
            elif emotion == 'amusement':
                rules.append("The user may be feeling amused or light-hearted.")
            elif emotion == 'anger':
                rules.append("The user is likely feeling anger — consider using calm and validating language.")
            elif emotion == 'annoyance':
                rules.append("The user may be annoyed or frustrated — approach with empathy.")
            elif emotion == 'approval':
                rules.append("The user shows signs of approval — this could reflect agreement or support.")
            elif emotion == 'caring':
                rules.append("The user expresses care — reinforce emotional connection.")
            elif emotion == 'confusion':
                rules.append("The user feels confused — aim to clarify and guide gently.")
            elif emotion == 'curiosity':
                rules.append("The user is curious — offer thoughtful insights.")
            elif emotion == 'desire':
                rules.append("The user shows desire — help them reflect on what they truly want.")
            elif emotion == 'disappointment':
                rules.append("The user is disappointed — acknowledge this and offer support.")
            elif emotion == 'disapproval':
                rules.append("The user expresses disapproval — be respectful and avoid judgment.")
            elif emotion == 'disgust':
                rules.append("The user is feeling disgust — keep the tone respectful and composed.")
            elif emotion == 'embarrassment':
                rules.append("The user may be feeling embarrassed — respond with kindness and reassurance.")
            elif emotion == 'excitement':
                rules.append("The user is excited — match their energy with positivity.")
            elif emotion == 'fear':
                rules.append("The user feels fear — offer emotional safety and reassurance.")
            elif emotion == 'gratitude':
                rules.append("The user feels gratitude — acknowledge it warmly.")
            elif emotion == 'grief':
                rules.append("The user is experiencing grief — respond with compassion and sensitivity.")
            elif emotion == 'joy':
                rules.append("The user is joyful — encourage them to embrace that feeling.")
            elif emotion == 'love':
                rules.append("The user is expressing love — handle this with warmth and care.")
            elif emotion == 'nervousness':
                rules.append("The user feels nervous — offer calming and encouraging support.")
            elif emotion == 'optimism':
                rules.append("The user is optimistic — reinforce their hopeful mindset.")                
            elif emotion == 'pride':
                rules.append("The user feels pride — affirm their sense of accomplishment.")
            elif emotion == 'realization':
                rules.append("The user had a realization — support their reflection process.")                
            elif emotion == 'relief':
                rules.append("The user feels relief — keep the tone light and supportive.")
            elif emotion == 'remorse':
                rules.append("The user expresses remorse — guide them with empathy and non-judgment.")
            elif emotion == 'sadness':
                rules.append("The user is sad — use a comforting and gentle tone.")
            elif emotion == 'surprise':
                rules.append("The user is surprised — acknowledge the unexpected nature of their feeling.")
            elif emotion == 'neutral':
                rules.append("The user feels neutral — maintain a calm and supportive tone.")

    return rules

## Template Function
def generate_prompt(user_name, message, emotions, complex_emotion=None):
    top_three_indices = np.argsort(emotions)[-3:][::-1] # Get the indices of the top 3 largest values in descending order
    top_three_emotions = []

    for index in top_three_indices:
        top_three_emotions.append(labels[index])

    prompt = f"Generate a short paragraph responding to the {user_name}'s message: '{message}', knowing they are feeling: {top_three_emotions}"
    
    if not complex_emotion is None:
        prompt = prompt + f", and can be interpreted as {complex_emotion}.\n"

    rules = rules_generator(emotions=emotions, complex_emotion=complex_emotion)

    for rule in rules:
        prompt += rule + "\n"
        
    return prompt
