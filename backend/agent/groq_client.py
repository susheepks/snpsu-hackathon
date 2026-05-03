"""
Groq LLM Client — wraps the Groq Python SDK for intent extraction.
Replace the stub in architect_agent.py with calls to this module.

Usage:
    from agent.groq_client import extract_intent

    result = await extract_intent("Book conference room A for tomorrow at 3pm")
    # → { "intent": "book_room", "confidence": 0.95, "entities": {...}, "reply": "..." }
"""

import os
import json
import time
from typing import Any

# pip install groq
# from groq import AsyncGroq

SYSTEM_PROMPT = """
You are an intent extraction engine for a voice AI agent.

Given a user utterance, respond ONLY with a valid JSON object:
{
  "intent": "<one of: book_room | send_email | search_web | open_url | calendar_add | play_music | clarify | general>",
  "confidence": <float 0.0–1.0>,
  "entities": {
    "date":     "<ISO date if mentioned>",
    "time":     "<HH:MM if mentioned>",
    "task":     "<main task description>",
    "location": "<location if mentioned>",
    "person":   "<person name if mentioned>",
    "subject":  "<email subject if mentioned>",
    "url":      "<URL if mentioned>"
  },
  "reply": "<short, friendly one-line response>"
}

If the intent is unclear, set intent to "clarify".
Never include markdown or explanation outside the JSON.
""".strip()


async def extract_intent(text: str) -> dict[str, Any]:
    """
    Call Groq API to extract intent and entities from user text.
    Falls back to a stub if GROQ_API_KEY is not set.
    """
    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        # Stub for development without API key
        return _stub_extraction(text)

    # Real Groq call (uncomment when API key is available):
    # client = AsyncGroq(api_key=api_key)
    # t0 = time.monotonic()
    # response = await client.chat.completions.create(
    #     model="llama3-70b-8192",
    #     messages=[
    #         {"role": "system", "content": SYSTEM_PROMPT},
    #         {"role": "user",   "content": text},
    #     ],
    #     temperature=0.1,
    #     max_tokens=256,
    # )
    # latency_ms = int((time.monotonic() - t0) * 1000)
    # raw = response.choices[0].message.content
    # result = json.loads(raw)
    # result["latency_ms"] = latency_ms
    # return result

    return _stub_extraction(text)


def _stub_extraction(text: str) -> dict:
    """Keyword-based stub for when Groq is not available."""
    text_lower = text.lower()
    if any(k in text_lower for k in ["book", "room", "reserve", "conference"]):
        return {"intent": "book_room",   "confidence": 0.88, "entities": {"task": text}, "reply": f"I'll book that for you."}
    if any(k in text_lower for k in ["email", "send", "mail", "write"]):
        return {"intent": "send_email",  "confidence": 0.85, "entities": {"task": text}, "reply": "Composing email now."}
    if any(k in text_lower for k in ["search", "find", "google", "look up"]):
        return {"intent": "search_web",  "confidence": 0.90, "entities": {"task": text}, "reply": "Searching the web."}
    if any(k in text_lower for k in ["open", "go to", "navigate", "visit"]):
        return {"intent": "open_url",    "confidence": 0.82, "entities": {"task": text}, "reply": "Opening that now."}
    return         {"intent": "clarify",     "confidence": 0.50, "entities": {},           "reply": "Could you be more specific?"}
