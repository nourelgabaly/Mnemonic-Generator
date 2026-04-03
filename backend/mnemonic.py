import openai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_mnemonic(word: str, native_language: str, target_language: str, context: str = "") -> dict:
    prompt = f"""
    You are a world-class language learning expert specializing in the Keyword Method —
    the most scientifically proven mnemonic technique for vocabulary retention.

    A student whose native language is {native_language} is learning {target_language}.
    They want to permanently remember this {target_language} word: "{word}"
    {"Additional context: " + context if context else ""}

    THE KEYWORD METHOD — follow these steps exactly:

    Step 1 — MEANING
    Clearly define what "{word}" means in {native_language} (the student's native language).
    Keep it simple and direct.

    Step 2 — FIND THE KEYWORD (most important step)
    Find a word or short phrase in {native_language} that sounds as similar as possible
    to "{word}" or to part of "{word}".
    This is called the "keyword". It must:
    - Be a real, familiar word in {native_language} that the student already knows
    - Sound phonetically similar to "{word}" or a part of it
    - Be concrete and visualizable (not abstract)

    Step 3 — CREATE THE BRIDGE
    Write a short, vivid mnemonic sentence (1-2 sentences) that:
    - Uses the keyword from Step 2
    - Connects it to the MEANING of "{word}"
    - Creates an unforgettable mental image linking the sound to the meaning
    - Is slightly surprising or amusing so it sticks

    Step 4 — IMAGE PROMPT
    Write a DALL-E 3 image prompt that illustrates the mnemonic bridge.
    The image must show the keyword visually connected to the meaning of "{word}".
    It should be a clean, striking illustration — beautiful colors, one clear scene,
    no text or labels in the image.
    The image should make the connection between the keyword sound and the word meaning
    immediately obvious when the student looks at it.

    Respond ONLY in this exact JSON format, no extra text, no markdown:
    {{
      "word": "{word}",
      "target_language": "{target_language}",
      "native_language": "{native_language}",
      "meaning": "meaning of {word} written in {native_language}",
      "keyword": "the similar-sounding word in {native_language}",
      "keyword_similarity": "brief explanation of the phonetic similarity",
      "mnemonic": "the bridge sentence written in {native_language}",
      "image_prompt": "..."
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)