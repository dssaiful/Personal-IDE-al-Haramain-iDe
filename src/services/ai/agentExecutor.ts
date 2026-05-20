import { streamGenerate } from './streamHandler';
import { buildPrompt } from './promptEngine';
import { collectContext } from './contextCollector';
import type { IDEFile } from '../../stores/ideStore';

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: string;
  error?: string;
  fileChanges?: Array<{ path: string; content: string; action: 'create' | 'edit' | 'delete' }>;
}

export interface AgentPlan {
  id: string;
  goal: string;
  tasks: AgentTask[];
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
}

export interface AgentCallbacks {
  onPlanCreated: (plan: AgentPlan) => void;
  onTaskStart: (taskId: string) => void;
  onTaskProgress: (taskId: string, token: string) => void;
  onTaskComplete: (taskId: string, result: string, fileChanges?: AgentTask['fileChanges']) => void;
  onTaskFailed: (taskId: string, error: string) => void;
  onPlanComplete: (plan: AgentPlan) => void;
  onLog: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function createPlan(
  model: string,
  userGoal: string,
  files: IDEFile[],
  openFiles: string[],
  currentFile: string | null,
  signal?: AbortSignal
): Promise<AgentPlan> {
  const context = collectContext(files, currentFile, openFiles);
  const { system, prompt } = buildPrompt(
    'ask_ai',
    `I need you to create a step-by-step plan to accomplish this goal: "${userGoal}"

Based on the project context, break this down into individual tasks. Each task should be specific and actionable.

Respond in this JSON format only (no markdown, no extra text):
{"tasks": [{"description": "task description"}, ...]}

Keep it to 3-8 tasks maximum.`,
    context
  );

  let fullText = '';

  await streamGenerate(
    { model, prompt, system, signal },
    {
      onToken: (token) => { fullText += token; },
      onDone: () => {},
      onError: () => {},
    }
  );

  let tasks: AgentTask[] = [];
  try {
    const jsonMatch = fullText.match(/\{[\s\S]*"tasks"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      tasks = parsed.tasks.map((t: { description: string }) => ({
        id: generateId(),
        description: t.description,
        status: 'pending' as const,
      }));
    }
  } catch {
    tasks = [{
      id: generateId(),
      description: userGoal,
      status: 'pending' as const,
    }];
  }

  if (tasks.length === 0) {
    tasks = [{
      id: generateId(),
      description: userGoal,
      status: 'pending' as const,
    }];
  }

  return {
    id: generateId(),
    goal: userGoal,
    tasks,
    status: 'planning',
    createdAt: Date.now(),
  };
}

export async function executeTask(
  model: string,
  task: AgentTask,
  plan: AgentPlan,
  files: IDEFile[],
  openFiles: string[],
  currentFile: string | null,
  callbacks: AgentCallbacks,
  signal?: AbortSignal
): Promise<void> {
  callbacks.onTaskStart(task.id);
  callbacks.onLog(`Executing: ${task.description}`, 'info');

  const context = collectContext(files, currentFile, openFiles);
  const { system, prompt } = buildPrompt(
    'generate_file',
    `Task: ${task.description}

Overall goal: ${plan.goal}

If this task requires creating or modifying files, provide the complete file content.
Format any file changes as:
--- FILE: filename.ext ---
file content here
--- END FILE ---

If no file changes are needed, just provide your analysis or explanation.`,
    context
  );

  let fullText = '';

  await streamGenerate(
    { model, prompt, system, signal },
    {
      onToken: (token) => {
        callbacks.onTaskProgress(task.id, token);
        fullText += token;
      },
      onDone: () => {
        const fileChanges = parseFileChanges(fullText);
        callbacks.onTaskComplete(task.id, fullText, fileChanges.length > 0 ? fileChanges : undefined);
        callbacks.onLog(`Completed: ${task.description}`, 'success');
      },
      onError: (error) => {
        callbacks.onTaskFailed(task.id, error);
        callbacks.onLog(`Failed: ${task.description} - ${error}`, 'error');
      },
    }
  );
}

function parseFileChanges(text: string): AgentTask['fileChanges'] & Array<unknown> {
  const changes: Array<{ path: string; content: string; action: 'create' | 'edit' | 'delete' }> = [];
  const fileRegex = /---\s*FILE:\s*(.+?)\s*---\n([\s\S]*?)---\s*END FILE\s*---/g;
  let match;

  while ((match = fileRegex.exec(text)) !== null) {
    changes.push({
      path: match[1].trim(),
      content: match[2].trim(),
      action: 'create',
    });
  }

  return changes;
}

export async function executePlan(
  model: string,
  plan: AgentPlan,
  files: IDEFile[],
  openFiles: string[],
  currentFile: string | null,
  callbacks: AgentCallbacks,
  signal?: AbortSignal
): Promise<AgentPlan> {
  const updatedPlan = { ...plan, status: 'executing' as const };
  callbacks.onLog(`Starting plan: ${plan.goal}`, 'info');

  for (const task of updatedPlan.tasks) {
    if (signal?.aborted) {
      task.status = 'cancelled';
      continue;
    }

    task.status = 'running';
    try {
      await executeTask(model, task, updatedPlan, files, openFiles, currentFile, callbacks, signal);
      task.status = 'completed';
    } catch (err) {
      task.status = 'failed';
      task.error = err instanceof Error ? err.message : 'Unknown error';
      callbacks.onLog(`Task failed: ${task.description}`, 'error');
    }
  }

  const allCompleted = updatedPlan.tasks.every(t => t.status === 'completed');
  (updatedPlan as { status: string }).status = allCompleted ? 'completed' : 'failed';
  callbacks.onPlanComplete(updatedPlan);
  return updatedPlan;
}
