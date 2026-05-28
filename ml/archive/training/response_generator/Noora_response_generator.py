import ollama

client = ollama.Client()

def Noora_response(Prompt, Model='Noora', Client=client):
    return Client.generate(model=Model, prompt= Prompt)

prompt = 'The User, Elio, is feeling nervous. He said: "I’m going through a really tough time right now, constantly stressed and anxious about where my life is headed, with exams and entrance tests piling up, all of them feeling like they’re deciding my entire future.". Please respond in an ethical way. The user feels nervous — offer calming and encouraging support.'

print(Noora_response(Prompt=prompt))
