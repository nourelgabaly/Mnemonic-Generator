import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

def signup_user(name: str, email: str, password: str) -> dict:
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"name": name}}
        })
        if res.user is None:
            raise ValueError("Signup failed. Please try again.")
        return {"name": name, "email": email, "message": "confirmation_sent"}
    except Exception as e:
        raise ValueError(str(e))


def login_user(email: str, password: str) -> dict:
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        if res.user is None:
            raise ValueError("Invalid email or password.")
        name = res.user.user_metadata.get("name", email.split("@")[0])
        return {"name": name, "email": email}
    except Exception as e:
        raise ValueError(str(e))


def reset_password(email: str):
    try:
        supabase.auth.reset_password_email(
            email,
            {"redirect_to": "http://localhost:3000/reset-password"}
        )
    except Exception as e:
        raise ValueError(str(e))