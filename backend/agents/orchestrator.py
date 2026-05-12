import time
from tools.base import TOOLS

class Planner:
    def __init__(self, model: str):
        self.model = model

    async def generate_plan(self, user_input: str, context: dict):
        # AI logic to break down tasks
        return [{"step": 1, "description": "Analyzing request"}, {"step": 2, "description": "Applying file changes"}]

class Executor:
    def __init__(self, model: str):
        self.model = model

    async def run_plan(self, plan: list, tool_registry: dict, auto_apply: bool = False):
        results = []
        for p in plan:
            # Execute step using tools safely
            step_res = {"status": "success", "step": p}
            if not auto_apply:
                step_res["confirmation_required"] = True
            else:
                step_res["confirmation_required"] = False
                step_res["applied"] = True
            results.append(step_res)
        return results

class ContextBuilder:
    async def build(self, workspace: str):
        return {"workspace": workspace, "files": ["src/main.tsx"]}

class MemoryStore:
    async def store_step(self, user_input: str, result: list):
        pass

class AgentOrchestrator:
    def __init__(self, model: str = "qwen3.6:35b"):
        self.model = model
        self.planner = Planner(model)
        self.executor = Executor(model)
        self.context = ContextBuilder()
        self.memory = MemoryStore()

    def get_tools(self):
        return TOOLS

    async def process_request(self, user_input: str, workspace: str, auto_apply: bool = False):
        ctx = await self.context.build(workspace)
        plan = await self.planner.generate_plan(user_input, ctx)
        result = await self.executor.run_plan(plan, tool_registry=self.get_tools(), auto_apply=auto_apply)
        await self.memory.store_step(user_input, result)
        return {"plan": plan, "result": result}
