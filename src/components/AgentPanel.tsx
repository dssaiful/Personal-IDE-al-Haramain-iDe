import React, { useState, useCallback } from 'react';
import { useIDEStore } from '../stores/ideStore';
import { createPlan, executePlan, type AgentPlan, type AgentCallbacks } from '../services/ai';
import { Play, StopCircle, CheckCircle2, XCircle, Loader2, Wand2, FileCode, ChevronDown, ChevronRight } from 'lucide-react';

export const AgentPanel: React.FC = () => {
  const [goalInput, setGoalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const {
    settings, files, openFiles, currentFile, agentPlan, setAgentPlan,
    agentLogs, addAgentLog, setAgentStatus, addFile, addNotification,
    ollamaStatus, saveFileToDisk,
  } = useIDEStore();

  const abortRef = React.useRef<AbortController | null>(null);

  const handleStart = useCallback(async () => {
    if (!goalInput.trim()) return;
    if (ollamaStatus !== 'connected') {
      addNotification('Ollama is not connected. Please start Ollama first.', 'error');
      return;
    }

    setIsRunning(true);
    setAgentStatus('planning');
    addAgentLog(`Agent planning: ${goalInput}`, 'info');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const plan = await createPlan(
        settings.aiModel, goalInput, files, openFiles, currentFile, controller.signal
      );
      setAgentPlan(plan);
      setAgentStatus('executing');
      addAgentLog(`Plan created with ${plan.tasks.length} tasks`, 'success');

      const callbacks: AgentCallbacks = {
        onPlanCreated: (p) => setAgentPlan(p),
        onTaskStart: (taskId) => {
          addAgentLog(`Starting task: ${plan.tasks.find(t => t.id === taskId)?.description || taskId}`, 'info');
        },
        onTaskProgress: () => {},
        onTaskComplete: (taskId, result, fileChanges) => {
          addAgentLog(`Task completed: ${plan.tasks.find(t => t.id === taskId)?.description || taskId}`, 'success');
          if (fileChanges) {
            for (const change of fileChanges) {
              addFile({ name: change.path, content: change.content });
              saveFileToDisk(change.path, change.content);
              addAgentLog(`Created file: ${change.path}`, 'success');
            }
          }
        },
        onTaskFailed: (taskId, error) => {
          addAgentLog(`Task failed: ${error}`, 'error');
        },
        onPlanComplete: (p) => {
          setAgentPlan(p);
          setAgentStatus('done');
          addAgentLog('Agent completed all tasks', 'success');
          addNotification('Agent mode completed', 'success');
        },
        onLog: (message, type) => addAgentLog(message, type),
      };

      await executePlan(settings.aiModel, plan, files, openFiles, currentFile, callbacks, controller.signal);
    } catch (err) {
      addAgentLog(`Agent error: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
      setAgentStatus('idle');
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [goalInput, settings, files, openFiles, currentFile, ollamaStatus, setAgentPlan, setAgentStatus, addAgentLog, addFile, addNotification, saveFileToDisk]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setAgentStatus('idle');
    addAgentLog('Agent cancelled by user', 'warning');
  }, [setAgentStatus, addAgentLog]);

  const toggleTask = (id: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      <div className="px-4 py-4 border-b border-ide-border bg-[#1e1e1e]">
        <div className="flex items-center gap-2 text-ide-accent mb-2">
          <Wand2 size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">Agent Mode</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-3">Describe a goal and the AI agent will plan and execute tasks autonomously.</p>

        <textarea
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder='e.g., "Build a todo app with React" or "Create a REST API with Express"'
          className="w-full bg-[#3c3c3c] border border-ide-border rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ide-accent resize-none h-20"
          disabled={isRunning}
        />

        <div className="flex gap-2 mt-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!goalInput.trim() || ollamaStatus !== 'connected'}
              className="flex-1 py-2 bg-ide-accent hover:bg-blue-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play size={14} /> Start Agent
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
            >
              <StopCircle size={14} /> Stop Agent
            </button>
          )}
        </div>
      </div>

      {/* Task Plan */}
      {agentPlan && (
        <div className="px-4 py-3 border-b border-ide-border">
          <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">
            Plan: {agentPlan.goal}
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] ${
              agentPlan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              agentPlan.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
              agentPlan.status === 'failed' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {agentPlan.status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {agentPlan.tasks.map((task, i) => (
              <div key={task.id} className="bg-[#1e1e1e] rounded border border-ide-border overflow-hidden">
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2d2e]"
                  onClick={() => toggleTask(task.id)}
                >
                  {expandedTasks.has(task.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span className="flex-1 text-[11px] text-gray-300">{i + 1}. {task.description}</span>
                  {task.status === 'completed' && <CheckCircle2 size={14} className="text-green-400" />}
                  {task.status === 'running' && <Loader2 size={14} className="text-blue-400 animate-spin" />}
                  {task.status === 'failed' && <XCircle size={14} className="text-red-400" />}
                  {task.status === 'pending' && <div className="w-3 h-3 rounded-full border border-gray-600" />}
                </div>
                {expandedTasks.has(task.id) && task.result && (
                  <div className="px-3 py-2 border-t border-ide-border text-[10px] text-gray-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {task.result.slice(0, 500)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Logs */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">Activity Log</div>
        <div className="flex flex-col gap-1">
          {agentLogs.slice(0, 30).map((log) => (
            <div key={log.id} className={`text-[10px] px-2 py-1 rounded border-l-2 ${
              log.type === 'success' ? 'border-green-500 bg-green-500/5 text-green-300' :
              log.type === 'error' ? 'border-red-500 bg-red-500/5 text-red-300' :
              log.type === 'warning' ? 'border-yellow-500 bg-yellow-500/5 text-yellow-300' :
              'border-blue-500 bg-blue-500/5 text-blue-300'
            }`}>
              <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
