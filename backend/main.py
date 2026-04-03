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
    native_language: str = "Arabic"
    target_language: str = "English"
    context: str = ""
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
            native_language=req.native_language,
            target_language=req.target_language,
            context=req.context
        )
        image_file = generate_image(mnemonic_data["image_prompt"])
        image_url = f"http://localhost:8000/static/{image_file}"

        result = {
            "word": mnemonic_data["word"],
            "target_language": mnemonic_data["target_language"],
            "native_language": mnemonic_data["native_language"],
            "meaning": mnemonic_data["meaning"],
            "keyword": mnemonic_data["keyword"],
            "keyword_similarity": mnemonic_data["keyword_similarity"],
            "mnemonic": mnemonic_data["mnemonic"],
            "image_url": image_url
        }

        if req.user_email:
            save_generation(
                user_email=req.user_email,
                word=result["word"],
                simple_meaning=result["meaning"],
                technique=f"Keyword Method ({result['native_language']} → {result['target_language']})",
                mnemonic=result["mnemonic"],
                image_url=image_url
            )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{user_email}")
async def history(user_email: str):
    try:
        generations = get_generations(user_email)
        return {"generations": generations}
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