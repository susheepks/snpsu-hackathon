# VoiceAI — AI Agent Mission Control

A hackathon-ready **voice agent dashboard** with:
- 🎙️ **Voice input** (Web Speech API + mic visualizer)
- 📡 **Real-time WebSocket** streaming from FastAPI backend
- 🧠 **Groq/llama3** intent extraction
- 🌐 **Playwright** browser automation
- 🎨 **Glassmorphism** dark-mode UI

---

## Quick Start

### Frontend
```bash
cd frontend
cp .env.example .env.local      # set NEXT_PUBLIC_WS_URL
npm install
npm run dev                      # → http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
playwright install chromium
cp .env.example .env             # set GROQ_API_KEY
uvicorn main:app --reload        # → ws://localhost:8000/ws
```

---

## Architecture

```
frontend/           Next.js 14 + Tailwind + Framer Motion
  src/
    app/
      page.tsx         ← Main Mission Control page
      globals.css      ← Design tokens + animations
    components/
      MissionHistory   ← Left sidebar: session log
      LiveFeed         ← Real-time [HEARD/THINK/ACTION/RESULT] log
      ActionCanvas     ← Center: Playwright browser view
      SystemBrain      ← Right sidebar: intent + entities + confidence
      VoiceCommandBar  ← Bottom: mic input + voice visualizer
      TaskMonitor      ← Right sidebar: active tasks
    hooks/
      useAgentWS       ← WebSocket hook with auto-reconnect
    lib/
      types.ts         ← Shared TypeScript types

backend/            FastAPI + Groq + Playwright
  main.py              ← App entrypoint
  api/
    websocket.py       ← WS /ws endpoint
    routes.py          ← REST /api/* endpoints
  agent/
    architect_agent.py ← Core pipeline (NLU → Execute → Stream)
    groq_client.py     ← Groq/LLM intent extraction
    browser_executor.py← Playwright browser automation
  requirements.txt
  .env.example
```

---

## WebSocket Protocol

```
Frontend → Backend:
  { "type": "command",  "text": "<user utterance>" }
  { "type": "ping" }

Backend → Frontend:
  { "type": "heard",      "text": "..." }
  { "type": "think",      "intent": "book_room", "confidence": 0.94, "entities": {...}, "latency_ms": 312 }
  { "type": "action",     "url": "https://..." }
  { "type": "screenshot", "data": "<base64 PNG>" }
  { "type": "result",     "text": "Done!" }
  { "type": "error",      "text": "..." }
  { "type": "clarify",    "text": "Please be more specific" }
  { "type": "pong" }
```

---

## Adding Your Backend

1. Open `backend/agent/architect_agent.py`
2. Replace `_stub_nlu()` with a real call to `groq_client.extract_intent()`
3. Uncomment the Playwright blocks in `browser_executor.py`
4. Set `GROQ_API_KEY` in `.env`
