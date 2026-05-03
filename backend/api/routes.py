"""
REST API routes — fallback for non-WS clients or testing.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from agent.architect_agent import ArchitectAgent

router = APIRouter()
agent = ArchitectAgent()


class CommandRequest(BaseModel):
    text: str


@router.post("/command")
async def run_command(req: CommandRequest):
    """
    Process a single command and return the full agent response.
    Prefer the WebSocket /ws endpoint for streaming.
    """
    events = []
    async for event in agent.run(req.text):
        events.append(event)
    return {"events": events}


@router.get("/missions")
async def get_missions():
    """Return the mission history (persisted in SQLite/Redis by agent)."""
    return {"missions": []}   # TODO: wire to persistence layer
