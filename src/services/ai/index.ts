export { detectOllama, fetchModels, pullModel, deleteModel, formatModelSize, getOllamaBaseUrl } from './modelManager';
export type { OllamaModel, ModelManagerState } from './modelManager';

export { streamGenerate, streamChat } from './streamHandler';
export type { StreamOptions, StreamCallbacks } from './streamHandler';

export { collectContext, buildContextPrompt, estimateTokens } from './contextCollector';
export type { WorkspaceContext } from './contextCollector';

export { buildPrompt, buildChatMessages, buildInlineCompletionPrompt } from './promptEngine';
export type { AIAction } from './promptEngine';

export { createPlan, executeTask, executePlan } from './agentExecutor';
export type { AgentTask, AgentPlan, AgentCallbacks } from './agentExecutor';
