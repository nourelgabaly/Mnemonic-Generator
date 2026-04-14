import os
import requests
import fal_client
from dotenv import load_dotenv

load_dotenv()

def generate_image(prompt: str) -> str:
    os.makedirs("static", exist_ok=True)

    filename = f"image_{abs(hash(prompt))}.png"
    filepath = f"static/{filename}"

    result = fal_client.run(
        "fal-ai/fast-sdxl",
        arguments={
            "prompt": prompt,
            "image_size": "square_hd"
        }
    )

    image_url = result["images"][0]["url"]

    img_bytes = requests.get(image_url, timeout=60).content

    with open(filepath, "wb") as f:
        f.write(img_bytes)

    print("[Image] SDXL (Fal) succeeded")
    return filename