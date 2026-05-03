# VoiceOps — AI Agent Mission Control

> **Hackathon 2026** · Speak a command → Watch the agent think, browse the web, and complete real tasks — all streamed live.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 · TypeScript · Framer Motion · Clerk Auth |
| **AI / NLU** | Groq API · Llama-3.3-70B-Versatile |
| **Speech-to-Text** | OpenAI Whisper (local, CPU) via `transcribe_local` |
| **Text-to-Speech** | Browser Web Speech API (SpeechSynthesis) |
| **Browser Automation** | Playwright (Chromium, persistent context) |
| **Backend** | FastAPI · Uvicorn · Python 3.12 |
| **Real-time Comms** | WebSocket (`/ws`) with auto-reconnect |
| **Auth** | Clerk (Next.js middleware, per-user data) |
| **Styling** | Vanilla CSS · Glassmorphism · Dark/Light mode |

---

## 🚀 Quick Start

### 1. Frontend

```bash
cd frontend
cp .env.example .env.local       # Fill in your keys (see below)
npm install
npm run dev                       # → http://localhost:3000
```

**Required `.env.local` keys:**
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. Backend (Linux / WSL)

```bash
cd ~
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn groq playwright pygame edge-tts
playwright install chromium

python3 -m uvicorn server:app --host 0.0.0.0 --port 8000
```

---

## 📁 Project Structure

```
hackathon/
├── server.py                 ← FastAPI entrypoint (WebSocket + REST)
├── agent3.py                 ← JarvisAgent class (Playwright + Groq)
├── transcribe_local.py       ← Whisper STT (local CPU inference)
│
└── frontend/                 Next.js App
    └── src/
        ├── app/
        │   ├── page.tsx          ← Landing page
        │   ├── layout.tsx        ← Root layout + Clerk provider
        │   ├── loading.tsx       ← Global loading screen
        │   ├── globals.css       ← Design tokens, glass UI, animations
        │   ├── dashboard/
        │   │   └── page.tsx      ← Mission Control (main live dashboard)
        │   ├── missions/
        │   │   └── page.tsx      ← Per-user Mission History (localStorage)
        │   └── settings/
        │       └── page.tsx      ← Agent config, voice, browser, UI prefs
        │
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx  ← Sidebar + TopBar wrapper
        │   │   ├── Sidebar.tsx   ← Navigation sidebar
        │   │   └── TopBar.tsx    ← Header with notifications + auth
        │   ├── LiveFeed.tsx      ← Real-time HEARD/THINK/ACTION/RESULT log
        │   ├── ActionCanvas.tsx  ← Playwright browser stream panel
        │   ├── VoiceCommandBar.tsx ← Mic input + waveform visualizer
        │   ├── MissionHistory.tsx  ← Session mission sidebar
        │   ├── SystemBrain.tsx   ← Intent + entities + confidence panel
        │   └── TaskMonitor.tsx   ← Active task tracker
        │
        └── hooks/
            └── useAgentWS.ts     ← WebSocket hook (auto-reconnect + ping)
```

---

## 🔌 WebSocket Protocol

```
Client → Server:
  { "type": "command",  "text": "<user utterance>" }
  { "type": "ping" }

Server → Client (streamed in order):
  { "type": "heard",      "text": "..." }
  { "type": "think",      "intent": "info|action|general",
                          "confidence": 0.9,
                          "entities": { ... },
                          "latency_ms": 312,
                          "reply": "Short spoken response" }
  { "type": "action",     "url": "https://..." }
  { "type": "screenshot", "data": "<base64 PNG>" }
  { "type": "result",     "text": "Final answer text" }
  { "type": "error",      "text": "Error description" }
  { "type": "clarify",    "text": "Need more details..." }
  { "type": "pong" }
```

---

## 🧠 Agent Pipeline

```
User Speaks
    │
    ▼
VoiceCommandBar  (Web Speech API / mic stream)
    │
    ▼
WebSocket /ws  →  FastAPI server.py
    │
    ▼
Groq LLM  (llama-3.3-70b-versatile)
  → Extracts: intent, confidence, entities, reply, query/service
    │
    ├── intent = "info"    → Google Search + Playwright screenshot
    │                       → get_google_summary() → result
    │
    ├── intent = "action"  → Navigate to service URL + Playwright
    │                       → result
    │
    └── intent = "general" → Direct LLM reply → result
    │
    ▼
WebSocket streams events back → Frontend renders live
    │
    ▼
Mission saved to localStorage (per Clerk user)
```

---

## 🗂️ Key Features

- **🎙️ Voice Input** — Speak naturally or type in the command bar. Browser microphone with waveform visualizer.
- **🧠 Live Agent Feed** — Real-time HEARD → THINK → ACTION → RESULT streaming over WebSocket.
- **🌐 Browser Automation** — Playwright Chromium navigates the web and streams screenshots back.
- **📋 Mission History** — Every completed command is persisted per Clerk user in `localStorage`.
- **🔔 Notifications** — TopBar notification bell with agent system alerts.
- **⚙️ Settings** — Agent model config, voice preferences, browser settings, dark/light theme toggle.
- **🔐 Auth** — Clerk-powered authentication. User data is scoped per account.
- **💾 Session Persistence** — Live feed logs, agent URL, and screenshots survive page refresh.

---

## 👥 Team

Built at **Hackathon 2026** with Next.js · FastAPI · Groq · Playwright.
