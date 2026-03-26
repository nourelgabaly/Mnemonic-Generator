from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from mnemonic import generate_mnemonic
from image_gen import generate_image
from auth import signup_user, login_user, reset_password
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


class MnemonicRequest(BaseModel):
    word: str
    context: str = ""

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetRequest(BaseModel):
    email: str


@app.post("/generate")
async def generate(req: MnemonicRequest):
    try:
        mnemonic_data = generate_mnemonic(req.word, req.context)
        image_file = generate_image(mnemonic_data["image_prompt"])
        image_url = f"http://localhost:8000/static/{image_file}"
        return {
            "word": mnemonic_data["word"],
            "simple_meaning": mnemonic_data["simple_meaning"],
            "technique": mnemonic_data["technique"],
            "mnemonic": mnemonic_data["mnemonic"],
            "image_url": image_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/signup")
async def signup(req: SignupRequest):
    try:
        user = signup_user(req.name, req.email, req.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
async def login(req: LoginRequest):
    try:
        user = login_user(req.email, req.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/forgot-password")
async def forgot_password(req: ResetRequest):
    try:
        reset_password(req.email)
        return {"message": "Reset email sent successfully."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/")
def root():
    return {"status": "MemBrain API is running"}