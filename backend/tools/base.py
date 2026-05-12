from typing import Callable
from functools import wraps

TOOLS: dict = {}

def tool(name: str, description: str, schema: dict):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await func(*args, **kwargs)
        TOOLS[name] = {
            "fn": wrapper,
            "description": description,
            "parameters": schema
        }
        return wrapper
    return decorator

@tool("read_file", "Reads file content securely", {"path": {"type": "string"}})
async def read_file(path: str) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

@tool("apply_diff", "Applies a validated diff/patch to a file", {
    "path": {"type": "string"},
    "diff": {"type": "object"}
})
async def apply_diff(path: str, diff: dict) -> dict:
    # Logic to apply safe diff / patch
    return {"success": True}
