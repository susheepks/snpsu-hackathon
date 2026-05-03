"""
VoiceOps — FastAPI Backend Entry Point
=======================================
Runs the WebSocket server that the Next.js frontend connects to.

Start with:
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /health         — health check
    WS   /ws             — main agent websocket
    POST /api/command    — REST fallback for commands
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.websocket import router as ws_router

app = FastAPI(
    title="VoiceOps Agent API",
    description="Backend for the AI Voice Agent Mission Control dashboard",
    version="1.0.0",
)

# CORS — allow Next.js dev server (Windows host → WSL backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # hackathon: open to all origins
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "voiceops-agent"}
