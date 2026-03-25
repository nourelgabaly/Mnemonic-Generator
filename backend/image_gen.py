import openai
import os
import requests
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_image(prompt: str) -> str:
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    image_url = response.data[0].url
    
    # Download and save the image locally so it doesn't expire after 1 hour
    os.makedirs("static", exist_ok=True)
    image_data = requests.get(image_url).content
    filename = f"image_{abs(hash(prompt))}.png"
    filepath = f"static/{filename}"
    
    with open(filepath, "wb") as f:
        f.write(image_data)
    
    return filename