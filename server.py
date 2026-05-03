from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import shutil, time, json as json_module, base64
from playwright.async_api import async_playwright
import os
from dotenv import load_dotenv
load_dotenv()

from groq import Groq
from transcribe_local import run_transcription

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise RuntimeError("GROQ_API_KEY not set. Please add it to your .env file.")
MODEL   = "llama-3.3-70b-versatile"
client  = Groq(api_key=API_KEY)

SYSTEM_PROMPT = """You are a voice-controlled AI agent. Parse the user's command and return ONLY valid JSON with these fields:
- intent: one of "info", "action", "general"
- reply: a short spoken confirmation (1 sentence)
- query: search query if intent is info
- service: target app/service if intent is action
- entities: dict of key entities
- confidence: float 0-1"""

async def get_google_summary(page) -> str:
    try:
        results = await page.query_selector_all("div.BNeawe")
        texts = [await r.inner_text() for r in results[:5]]
        return " ".join(texts).strip() or "Search completed."
    except Exception:
        return "Search completed."

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

state = {"context": None, "page": None}


async def get_page():
    """Auto-recover if the Playwright page has been closed."""
    if state["page"] is None or state["page"].is_closed():
        print("⚠️  Page closed — reopening...")
        state["page"] = await state["context"].new_page()
    return state["page"]


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🔌 Client connected via WebSocket")
    try:
        while True:
            data = await websocket.receive_text()
            msg = json_module.loads(data)

            # Heartbeat
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg.get("type") == "command":
                text = msg.get("text", "").strip()
                if not text:
                    continue

                # 1. Echo heard
                await websocket.send_json({"type": "heard", "text": text})

                # 2. Groq intent extraction
                start = time.monotonic()
                completion = client.chat.completions.create(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user",   "content": text}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0
                )
                latency_ms = int((time.monotonic() - start) * 1000)
                res = json_module.loads(completion.choices[0].message.content)

                intent = res.get("intent", "general")
                reply  = res.get("reply", "")
                query  = res.get("query", text)

                # 3. Think event
                await websocket.send_json({
                    "type":       "think",
                    "intent":     intent,
                    "confidence": res.get("confidence", 0.85),
                    "entities":   res.get("entities", {"task": text}),
                    "latency_ms": latency_ms,
                    "reply":      reply,
                })

                # 4. Execute
                if intent == "info":
                    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
                    await websocket.send_json({"type": "action", "url": search_url})
                    page = await get_page()
                    await page.goto(search_url, wait_until="commit")
                    screenshot = await page.screenshot()
                    await websocket.send_json({
                        "type": "screenshot",
                        "data": base64.b64encode(screenshot).decode()
                    })
                    final_answer = await get_google_summary(page)
                    # await speak(reply)        # TTS disabled
                    # await speak(final_answer)  # TTS disabled
                    await websocket.send_json({"type": "result", "text": final_answer})

                elif intent == "action":
                    service    = res.get("service", "search")
                    action_url = f"https://www.google.com/search?q={service}+{text.replace(' ', '+')}"
                    await websocket.send_json({"type": "action", "url": action_url})
                    page = await get_page()
                    await page.goto(action_url)
                    screenshot = await page.screenshot()
                    await websocket.send_json({
                        "type": "screenshot",
                        "data": base64.b64encode(screenshot).decode()
                    })
                    final_answer = f"Opened {service} portal for: {text}"
                    # await speak(reply)        # TTS disabled
                    # await speak(final_answer)  # TTS disabled
                    await websocket.send_json({"type": "result", "text": final_answer})

                else:
                    # await speak(reply)  # TTS disabled
                    await websocket.send_json({"type": "result", "text": reply or f"Done: {text}"})

    except WebSocketDisconnect:
        print("🔌 Client disconnected")
    except Exception as e:
        print(f"[WS ERROR] {e}")
        try:
            await websocket.send_json({"type": "error", "text": str(e)})
        except Exception:
            pass


@app.on_event("startup")
async def startup():
    playwright = await async_playwright().start()
    state["context"] = await playwright.chromium.launch_persistent_context(
        "./user_data",
        headless=False,
        args=["--start-maximized"]
    )
    state["page"] = state["context"].pages[0]
    print("🚀 Jarvis Systems Linked to API")


@app.post("/command")
async def handle_voice_command(file: UploadFile = File(...)):
    temp_audio = "command.wav"
    with open(temp_audio, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = run_transcription(temp_audio)
    if not raw_text or len(raw_text) < 3:
        return {"error": "No clear command detected"}

    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": raw_text}
        ],
        response_format={"type": "json_object"},
        temperature=0
    )
    res = json.loads(completion.choices[0].message.content)
    reply  = res.get("reply")
    intent = res.get("intent")
    query  = res.get("query")

    # await speak(reply)  # TTS disabled
    final_answer = ""

    if intent == "info":
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        page = await get_page()
        await page.goto(search_url, wait_until="commit")
        final_answer = await get_google_summary(page)
        # await speak(final_answer)  # TTS disabled
    elif intent == "action":
        service = res.get("service", "search")
        page = await get_page()
        await page.goto(f"https://www.google.com/search?q=book+{service}+{raw_text.replace(' ', '+')}")
        final_answer = f"I have established a link to the {service} portal."
        # await speak(final_answer)  # TTS disabled

    return {"user_query": raw_text, "jarvis_reply": reply, "ai_summary": final_answer, "intent": intent}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
