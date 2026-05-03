"""
WebSocket Router — streams agent events to the frontend in real time.

Message protocol (JSON):
  Frontend → Backend:
    { "type": "command", "text": "<user utterance>" }
    { "type": "ping" }

  Backend → Frontend:
    { "type": "heard",   "text": "..." }
    { "type": "think",   "intent": "...", "confidence": 0.9, "entities": {...}, "latency_ms": 300 }
    { "type": "action",  "url": "https://..." }
    { "type": "result",  "text": "..." }
    { "type": "error",   "text": "..." }
    { "type": "clarify", "text": "..." }
    { "type": "screenshot", "data": "<base64 PNG>" }
    { "type": "pong" }
"""

import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from agent.architect_agent import ArchitectAgent

router = APIRouter()
agent = ArchitectAgent()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
                continue

            if msg.get("type") == "command":
                text: str = msg.get("text", "").strip()
                if not text:
                    continue

                # Echo back what was heard
                await ws.send_json({"type": "heard", "text": text})

                # Run the agent pipeline
                async for event in agent.run(text):
                    await ws.send_json(event)
                    await asyncio.sleep(0)   # yield control

    except WebSocketDisconnect:
        print("[WS] Client disconnected")
    except Exception as e:
        await ws.send_json({"type": "error", "text": str(e)})
