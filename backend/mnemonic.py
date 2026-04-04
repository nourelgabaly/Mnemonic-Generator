import openai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_input(word: str) -> str:
    """
    Determine whether the input is better suited for
    visual association (single concept/mechanism) or
    acronym (list, sequence, or multi-item set).
    """
    prompt = f"""
    A medical student entered this input: "{word}"

    Classify it into ONE of two categories:
    - "visual" — if it is a single medical concept, disease, mechanism, 
      anatomical structure, drug, or symptom that can be visually represented
    - "acronym" — if it is a list of items, a sequence of steps, a set of 
      causes/symptoms/criteria, or multiple items that need to be memorized together

    Respond with ONLY one word: either "visual" or "acronym"
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return response.choices[0].message.content.strip().lower()


def generate_visual_mnemonic(word: str, context: str = "") -> dict:
    prompt = f"""
    You are a medical education expert specializing in visual mnemonics for medical students.
    A medical student wants to permanently remember the medical term: "{word}"
    {"Additional context: " + context if context else ""}

    Use the VISUAL ASSOCIATION technique — the most effective mnemonic technique for
    medical concepts, validated by a 2025 DALL-E 3 study with 275 medical students
    showing improved long-term retention over traditional methods.

    Steps:

    1. DEFINITION
    Write a clear, concise clinical definition of "{word}" in 1-2 sentences.
    Use plain English that a first-year medical student can understand.

    2. CORE VISUAL CONCEPT
    Identify the single most essential visual element that captures the meaning of "{word}".
    Think: if a medical student sees this image with no caption during an exam,
    they should immediately recall what "{word}" means.
    The image must NOT show a generic anatomical diagram or textbook illustration.
    It must be a striking, memorable visual anchor — creative but clearly connected
    to the clinical meaning.

    3. MNEMONIC TIP
    Write 1-2 sentences connecting the visual to the meaning of "{word}".
    This should feel like a clever insight that makes the student say "I'll never forget that."

    4. IMAGE PROMPT
    Write a DALL-E 3 prompt for a visually striking medical illustration that:
    - Captures the core clinical meaning of "{word}" through a memorable visual metaphor
    - Is clean and focused — one central subject, not a busy scene
    - Uses bold, intentional colors that enhance memorability
    - Looks like high-quality medical digital art — not a textbook diagram
    - Contains NO text, labels, or anatomical annotations in the image
    - Would immediately trigger recall of "{word}" when seen weeks later

    Respond ONLY in this exact JSON format, no extra text, no markdown:
    {{
      "word": "{word}",
      "technique": "Visual Association",
      "definition": "...",
      "visual_concept": "...",
      "mnemonic": "...",
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


def generate_acronym_mnemonic(word: str, context: str = "") -> dict:
    prompt = f"""
    You are a medical education expert specializing in acronym mnemonics for medical students.
    A medical student wants to remember this medical list or concept: "{word}"
    {"Additional context: " + context if context else ""}

    Use the ACRONYM technique — the most recalled mnemonic type in medical education,
    dominant in real clinical practice (e.g. ABCDE, OPQRST, I GET SMASHED).

    Steps:

    1. DEFINITION
    Clearly explain what "{word}" refers to and why it matters clinically in 1-2 sentences.

    2. CREATE THE ACRONYM
    Create a memorable acronym or acrostic for "{word}" where:
    - Each letter stands for one key item, symptom, cause, or step
    - The acronym spells a real English word OR a short memorable phrase
    - Each item is a genuine, clinically accurate piece of information
    - The full list is complete and medically accurate
    If "{word}" is already an acronym (like ABCDE), explain what each letter means
    and create a memorable sentence using those words.

    3. MEMORY SENTENCE
    If the acronym spells a word: write a vivid sentence using that word that
    connects to the clinical meaning.
    If it is an acrostic: write the sentence itself as the mnemonic.

    4. MNEMONIC TIP
    Write 1-2 sentences explaining the connection between the acronym and the
    medical concept in a memorable way.

    5. IMAGE PROMPT
    Write a DALL-E 3 prompt for a visual that:
    - Illustrates the memory sentence or the concept the acronym represents
    - Is bold, colorful, and immediately striking
    - Shows the meaning of the acronym visually — not letters on a screen
    - Looks like high quality medical illustration or concept art
    - Contains NO text or letters in the image

    Respond ONLY in this exact JSON format, no extra text, no markdown:
    {{
      "word": "{word}",
      "technique": "Acronym",
      "definition": "...",
      "acronym_letters": [
        {{"letter": "A", "stands_for": "..."}},
        {{"letter": "B", "stands_for": "..."}}
      ],
      "memory_sentence": "...",
      "mnemonic": "...",
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


def generate_mnemonic(word: str, context: str = "") -> dict:
    technique = classify_input(word)
    if technique == "acronym":
        return generate_acronym_mnemonic(word, context)
    else:
        return generate_visual_mnemonic(word, context)