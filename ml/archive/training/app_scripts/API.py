import os

from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from archive.training.app_scripts.main import predict, run_pipeline

app = FastAPI(title='Noora_app', version='1.0')

API_KEY = os.getenv('API_KEY')

class SignupReq(BaseModel):
    email : EmailStr
    password : str

class SigninReq(BaseModel):
    email : EmailStr
    password : str

class RunAppReq(BaseModel):
    input : str
    UserID : str
        

@app.post('/run_app')
def run_app(req: RunAppReq):

    output = run_pipeline(user=req.UserID, input=req.input)

    # SEND output['response'] TO THE DEVICE

    return {'response': output['response'], 'emotions': output['emotions'], 'complex_emotion': output['complex_emotion']}


