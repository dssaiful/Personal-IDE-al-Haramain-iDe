from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run

from ollama.router import router as ollama_router
from agents.orchestrator import AgentOrchestrator

app = FastAPI(title="Local AI IDE Backend")

# Enable CORS for the local React App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ollama_router)

orchestrator = AgentOrchestrator()

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    print("Starting Local AI IDE FastApi Backend on port 8000...")
    run("main:app", host="127.0.0.1", port=8000, reload=True)
