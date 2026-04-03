import openai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_mnemonic(word: str, native_language: str, target_language: str, context: str = "") -> dict:
    prompt = f"""
    You are a world-class language learning expert combining two proven scientific frameworks:

    FRAMEWORK 1 — THE KEYWORD METHOD
    The most empirically validated mnemonic technique for foreign vocabulary retention.
    It works by finding a word in the learner's native language that sounds phonetically
    similar to the foreign word, then creating a vivid image that bridges the sound to the meaning.

    FRAMEWORK 2 — ELEANOR ROSCH'S PROTOTYPE THEORY & BASIC LEVEL CATEGORIZATION
    Rosch's cognitive science research established that human memory works best when concepts
    are represented at their most prototypical and basic level. You must apply her three principles:

    A) PROTOTYPE PRINCIPLE: Always use the most central, typical, best-example member of any
       category. A robin is a better "bird" than a penguin. A chair is a better "furniture" than
       a lamp. Prototypical examples are recognized faster, processed more easily, and remembered
       longer. Never use peripheral or atypical examples in the keyword or image.

    B) BASIC LEVEL PRINCIPLE: Choose concepts at the optimal level of abstraction — not too
       broad (avoid "animal", "object", "thing") and not too specific (avoid obscure subcategories).
       "Dog" is better than "mammal" (too abstract) or "chihuahua" (too specific).
       Basic level concepts are: learned first by children, named fastest by adults, have the most
       distinctive visual shape, and are most frequent in everyday language. Always prefer them.

    C) FAMILY RESEMBLANCE PRINCIPLE: The keyword and its visual representation should share
       as many recognizable features as possible with both the foreign word's sound AND its meaning.
       The more connections the image creates, the more durable the memory trace.

    ---

    A student whose native language is {native_language} is learning {target_language}.
    They want to permanently remember this {target_language} word: "{word}"
    {"Additional context: " + context if context else ""}

    Follow these steps exactly:

    Step 1 — MEANING
    Define what "{word}" means simply and clearly in {native_language}.

    Step 2 — KEYWORD SELECTION (apply Rosch's Basic Level + Prototype principles)
    Find a word or short phrase in {native_language} that:
    - Sounds phonetically as similar as possible to "{word}" or part of it
    - Is a BASIC LEVEL concept (optimal abstraction — not too broad, not too specific)
    - Is the PROTOTYPICAL example of its category (the first example that comes to mind)
    - Is concrete, familiar, and has a clear, distinctive visual shape
    - Is a word the average {native_language} speaker would know and recognize instantly
    This is the keyword bridge — the phonetic anchor connecting the foreign word to memory.

    Step 3 — MNEMONIC BRIDGE SENTENCE (apply Family Resemblance principle)
    Write a short vivid mnemonic sentence (1-2 sentences) in {native_language} that:
    - Uses the keyword naturally
    - Connects it clearly to the MEANING of "{word}"
    - Creates an image that shares features with both the sound AND the meaning
    - Is slightly surprising or specific enough to be unforgettable
    - Feels natural and logical — not random or forced

    Step 4 — IMAGE PROMPT (apply all three Rosch principles to the visual)
    Write a DALL-E 3 image prompt that:
    - Illustrates the mnemonic bridge between the keyword sound and the word meaning
    - Uses only PROTOTYPICAL, BASIC LEVEL visual elements — show the most typical,
      instantly recognizable version of every object or concept in the scene
    - Avoids peripheral, unusual, or overly specific visual elements
    - Has one clear focal point with a simple, clean composition
    - Uses rich, intentional colors and beautiful lighting
    - Feels like high quality digital illustration
    - Contains NO text, labels, or words in the image
    - Would be immediately understood by a {native_language} speaker who sees it

    Respond ONLY in this exact JSON format, no extra text, no markdown:
    {{
      "word": "{word}",
      "target_language": "{target_language}",
      "native_language": "{native_language}",
      "meaning": "meaning of {word} written simply in {native_language}",
      "keyword": "the similar-sounding basic-level word in {native_language}",
      "keyword_similarity": "brief explanation of the phonetic similarity in English",
      "rosch_justification": "one sentence explaining why this keyword is prototypical and basic-level",
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