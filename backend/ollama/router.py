from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/ollama", tags=["ollama"])

DEFAULT_MODEL = "qwen3.6:35b"

class ChatRequest(BaseModel):
    messages: list[dict]
    model: str = DEFAULT_MODEL
    stream: bool = True

@router.post("/chat")
async def chat(req: ChatRequest):
    # Proxy the request to local Ollama instance
    async def stream_generator():
        async with httpx.AsyncClient(timeout=120) as client:
            payload = {
                "model": req.model,
                "messages": req.messages,
                "stream": req.stream,
                "options": {"temperature": 0.2, "num_ctx": 8192}
            }
            try:
                async with client.stream("POST", "http://127.0.0.1:11434/api/chat", json=payload) as resp:
                    async for chunk in resp.aiter_lines():
                        if chunk:
                            yield chunk + "\n"
            except Exception as e:
                yield f'{{"error": "Failed to connect to Ollama. Ensure Ollama is running locally. Detail: {str(e)}"}}\n'

    if req.stream:
        return StreamingResponse(stream_generator(), media_type="application/x-ndjson")
    else:
        async with httpx.AsyncClient(timeout=120) as client:
            payload = {
                "model": req.model,
                "messages": req.messages,
                "stream": False
            }
            resp = await client.post("http://127.0.0.1:11434/api/chat", json=payload)
            return resp.json()
