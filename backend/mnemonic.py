import openai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ─── MEDICAL MODE ────────────────────────────────────────────────────────────

def classify_medical_input(word: str) -> str:
    prompt = f"""A medical student entered: "{word}"
Classify into ONE category:
- "visual" if it is a single medical concept, disease, mechanism, drug, or symptom
- "acronym" if it is a list, sequence, set of causes/symptoms/criteria, or multiple items

Respond with ONLY one word: visual or acronym"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return response.choices[0].message.content.strip().lower()


def generate_medical_visual(word: str, context: str = "") -> dict:
    prompt = f"""You are a medical education expert specializing in visual mnemonics.
A medical student wants to remember: "{word}"
{"Context: " + context if context else ""}

Use the VISUAL ASSOCIATION technique — proven by a 2025 DALL-E 3 study with 275 medical students.

1. DEFINITION: Clear clinical definition in 1-2 sentences, plain English.
2. VISUAL CONCEPT: The single most memorable visual that captures "{word}" meaning.
   NOT a textbook diagram — a striking, creative visual anchor clearly connected to the clinical meaning.
3. MNEMONIC TIP: 1-2 sentences making the student say "I'll never forget that."
4. IMAGE PROMPT: DALL-E 3 prompt for a striking medical illustration that:
   - Captures the core clinical meaning through a memorable visual metaphor
   - One central subject, bold intentional colors, high quality medical digital art
   - NO text, labels, or anatomical annotations in the image

Respond ONLY in this exact JSON, no extra text:
{{
  "word": "{word}",
  "mode": "medical",
  "technique": "Visual Association",
  "definition": "...",
  "visual_concept": "...",
  "mnemonic": "...",
  "image_prompt": "..."
}}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    text = response.choices[0].message.content.strip().replace("```json","").replace("```","").strip()
    return json.loads(text)


def generate_medical_acronym(word: str, context: str = "") -> dict:
    prompt = f"""You are a medical education expert specializing in acronym mnemonics.
A medical student wants to remember: "{word}"
{"Context: " + context if context else ""}

Use the ACRONYM technique — most recalled mnemonic type in clinical practice (ABCDE, OPQRST, I GET SMASHED).

1. DEFINITION: What "{word}" refers to and why it matters clinically.
2. ACRONYM: Create a memorable acronym where each letter = one key item/symptom/cause/step.
   Must spell a real English word OR a short memorable phrase. Must be clinically accurate.
3. MEMORY SENTENCE: A vivid sentence using the acronym word connecting to the clinical meaning.
4. MNEMONIC TIP: 1-2 sentences explaining the connection memorably.
5. IMAGE PROMPT: DALL-E 3 prompt illustrating the memory sentence visually.
   Bold, colorful, striking — NO text or letters in the image.

Respond ONLY in this exact JSON, no extra text:
{{
  "word": "{word}",
  "mode": "medical",
  "technique": "Acronym",
  "definition": "...",
  "acronym_letters": [
    {{"letter": "A", "stands_for": "..."}},
    {{"letter": "B", "stands_for": "..."}}
  ],
  "memory_sentence": "...",
  "mnemonic": "...",
  "image_prompt": "..."
}}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    text = response.choices[0].message.content.strip().replace("```json","").replace("```","").strip()
    return json.loads(text)


# ─── LANGUAGE MODE ───────────────────────────────────────────────────────────

def generate_language_mnemonic(word: str, native_language: str, target_language: str, context: str = "") -> dict:
    prompt = f"""You are a world-class language learning expert combining two scientific frameworks:

FRAMEWORK 1 — THE KEYWORD METHOD
Find a word in the learner's native language that sounds phonetically similar to the foreign word,
then create a vivid image bridging the sound to the meaning.

FRAMEWORK 2 — ELEANOR ROSCH'S PROTOTYPE THEORY & BASIC LEVEL CATEGORIZATION
A) PROTOTYPE PRINCIPLE: Use the most central, typical example of any category.
B) BASIC LEVEL PRINCIPLE: Choose concepts at optimal abstraction — not too broad, not too specific.
C) FAMILY RESEMBLANCE PRINCIPLE: Maximize shared features between keyword and meaning.

A student whose native language is {native_language} is learning {target_language}.
Word to remember: "{word}"
{"Context: " + context if context else ""}

Steps:
1. MEANING: Define "{word}" simply in {native_language}.
2. KEYWORD: Find a {native_language} word phonetically similar to "{word}" — basic level, prototypical, concrete.
3. BRIDGE SENTENCE: Short vivid mnemonic in {native_language} connecting keyword to meaning.
4. ROSCH JUSTIFICATION: One sentence why this keyword is cognitively optimal.
5. IMAGE PROMPT: DALL-E 3 prompt illustrating the keyword-meaning bridge.
   Clean, striking, rich colors, one clear scene. NO text in the image.

Respond ONLY in this exact JSON, no extra text:
{{
  "word": "{word}",
  "mode": "language",
  "technique": "Keyword Method + Prototype Theory",
  "target_language": "{target_language}",
  "native_language": "{native_language}",
  "meaning": "...",
  "keyword": "...",
  "keyword_similarity": "...",
  "rosch_justification": "...",
  "mnemonic": "...",
  "image_prompt": "..."
}}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    text = response.choices[0].message.content.strip().replace("```json","").replace("```","").strip()
    return json.loads(text)


# ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────

def generate_mnemonic(word: str, mode: str = "medical", context: str = "",
                      native_language: str = "Arabic", target_language: str = "English") -> dict:
    if mode == "language":
        return generate_language_mnemonic(word, native_language, target_language, context)
    else:
        technique = classify_medical_input(word)
        if technique == "acronym":
            return generate_medical_acronym(word, context)
        else:
            return generate_medical_visual(word, context)