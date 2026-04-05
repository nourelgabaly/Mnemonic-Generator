from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from mnemonic import generate_mnemonic
from image_gen import generate_image
from auth import signup_user, login_user, reset_password, save_generation, get_generations
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
    mode: str = "medical"           # "medical" or "language"
    context: str = ""
    native_language: str = "Arabic"
    target_language: str = "English"
    user_email: str = ""

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
        mnemonic_data = generate_mnemonic(
            word=req.word,
            mode=req.mode,
            context=req.context,
            native_language=req.native_language,
            target_language=req.target_language
        )
        image_file = generate_image(mnemonic_data["image_prompt"])
        image_url = f"http://localhost:8000/static/{image_file}"
        result = {**mnemonic_data, "image_url": image_url}

        if req.user_email:
            save_generation(
                user_email=req.user_email,
                word=mnemonic_data["word"],
                simple_meaning=mnemonic_data.get("definition") or mnemonic_data.get("meaning", ""),
                technique=mnemonic_data["technique"],
                mnemonic=mnemonic_data["mnemonic"],
                image_url=image_url
            )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{user_email}")
async def history(user_email: str):
    try:
        return {"generations": get_generations(user_email)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/signup")
async def signup(req: SignupRequest):
    try:
        return signup_user(req.name, req.email, req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
async def login(req: LoginRequest):
    try:
        return login_user(req.email, req.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/forgot-password")
async def forgot_password(req: ResetRequest):
    try:
        reset_password(req.email)
        return {"message": "Reset email sent."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/")
def root():
    return {"status": "MemBrain API running"}