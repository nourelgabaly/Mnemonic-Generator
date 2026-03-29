import openai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_mnemonic(word: str, context: str = "") -> dict:
    prompt = f"""
    You are an expert memory coach. A student wants to memorize the concept: "{word}".
    {"Additional context: " + context if context else ""}

    Your job:
    1. Identify what "{word}" means in simple terms
    2. Choose the BEST mnemonic technique from:
       - Visual association (linking to a vivid image)
       - Acronym (first letters form a word)
       - Rhyme or rhythm
       - Storytelling (short memorable story)
       - Chunking (breaking it into parts)
       - Association: Connecting new, hard-to-remember information with a familiar image (e.g., drawing a snake in the shape of the letter 'S' to help children remember its sound).
       - Memory Palace (Loci System): Visualizing familiar locations (like rooms in a house) to store and recall information in specific, ordered spots.
       - Rebus/Letter Imagery: Using pictures that look like letters or concepts, such as a flag shaped like the letter 'F'.
       - Storyboarding: Creating a short, unique story with characters to remember a series of facts.
    3. Create a short, vivid mnemonic using that technique
    4. Write a DALL-E 3 style image prompt that visually captures the mnemonic

    Respond ONLY in this exact JSON format, no extra text, no markdown:
    {{
      "word": "{word}",
      "simple_meaning": "...",
      "technique": "...",
      "mnemonic": "...",
      "image_prompt": "an illustration showing ..."
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)