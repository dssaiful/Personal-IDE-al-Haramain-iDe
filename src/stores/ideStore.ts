import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { fetchModels, type OllamaModel, type AgentPlan, type AgentTask } from '../services/ai';

const BACKEND_URL = '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  text: string;
  images?: string[];
  files?: string[];
  isStreaming?: boolean;
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface IDEFile {
  name: string;
  content: string;
  isDirty?: boolean;
  savedContent?: string;
}

export interface AgentLog {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

export interface FileGenerationRequest {
  id: string;
  prompt: string;
  fileName: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecoveryData {
  files: IDEFile[];
  openFiles: string[];
  currentFile: string | null;
  chatHistories: Record<string, ChatMessage[]>;
  timestamp: number;
}

interface IDEState {
  currentFile: string | null;
  files: IDEFile[];
  openFiles: string[];

  workspaceId: string;
  chatHistories: Record<string, ChatMessage[]>;

  agentStatus: 'idle' | 'planning' | 'executing' | 'retrying' | 'done';
  agentLogs: AgentLog[];
  agentPlan: AgentPlan | null;

  stableMetrics: {
    cpu: string;
    memory: string;
    latency: string;
    uptime: string;
  };
  activeExtensions: string[];
  ollamaStatus: 'checking' | 'connected' | 'disconnected';
  localModels: OllamaModel[];
  settings: {
    autoApplyDiffs: boolean;
    confirmToolCalls: boolean;
    aiModel: string;
    temperature: number;
    contextEnabled: boolean;
    inlineCompletionEnabled: boolean;
  };
  notifications: Notification[];
  installedExtensions: string[];
  isDevServerRunning: boolean;
  gitInSync: boolean;
  lastCommitHash: string;
  hasShownWelcome: boolean;

  // Streaming
  streamingMessageId: string | null;
  abortController: AbortController | null;

  // Terminal AI
  recentTerminalOutput: string;

  // Git AI
  gitDiff: string;

  // File Generation
  pendingFileGen: FileGenerationRequest | null;

  // Selected code for context menu AI
  selectedCode: string;

  // Recovery
  lastRecovery: RecoveryData | null;
  sessionStartTime: number;

  // Actions
  setFile: (p: string) => void;
  setWorkspace: (id: string) => void;
  pushChat: (msg: ChatMessage) => void;
  updateStreamingMessage: (id: string, token: string) => void;
  finalizeStreamingMessage: (id: string) => void;
  clearChat: () => void;
  deleteMessage: (id: string) => void;
  editMessage: (id: string, newText: string) => void;
  setAgentStatus: (s: IDEState['agentStatus']) => void;
  addAgentLog: (msg: string, type?: AgentLog['type']) => void;
  setAgentPlan: (plan: AgentPlan | null) => void;
  updateAgentTask: (taskId: string, updates: Partial<AgentTask>) => void;
  updateSetting: <K extends keyof IDEState['settings']>(key: K, value: IDEState['settings'][K]) => void;
  checkOllama: () => Promise<void>;
  addNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
  addFile: (file: IDEFile) => void;
  closeFile: (name: string) => void;
  updateFile: (name: string, content: string) => void;
  markFileDirty: (name: string, dirty: boolean) => void;
  deleteFile: (name: string) => void;
  renameFile: (oldName: string, newName: string) => void;
  toggleDevServer: () => void;
  syncGit: () => void;
  setHasShownWelcome: (v: boolean) => void;
  fetchFiles: () => Promise<void>;
  saveFileToDisk: (name: string, content: string) => Promise<void>;
  setAbortController: (controller: AbortController | null) => void;
  setStreamingMessageId: (id: string | null) => void;
  setRecentTerminalOutput: (output: string) => void;
  setGitDiff: (diff: string) => void;
  setSelectedCode: (code: string) => void;
  setPendingFileGen: (req: FileGenerationRequest | null) => void;
  saveRecovery: () => void;
  restoreFromRecovery: () => boolean;
}

function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useIDEStore = create<IDEState>()(
  persist(
    immer((set, get) => ({
      currentFile: null,
      files: [],
      openFiles: [],
      workspaceId: 'default-project',
      chatHistories: {
        'default-project': [
          { id: genId(), role: 'assistant', text: 'Hello! I am your Local AI Engineer running on Ollama. How can I help you code today?', timestamp: Date.now() }
        ]
      },
      agentStatus: 'idle',
      agentLogs: [
        { id: '1', type: 'info', message: 'Autonomous Engine Initialized', timestamp: Date.now() }
      ],
      agentPlan: null,
      stableMetrics: {
        cpu: '1.2%',
        memory: '242 MB',
        latency: '14ms',
        uptime: '0h 0m'
      },
      activeExtensions: ['Python', 'Prettier', 'GitLens', 'Tailwind CSS IntelliSense'],
      ollamaStatus: 'checking',
      localModels: [],
      settings: {
        autoApplyDiffs: false,
        confirmToolCalls: true,
        aiModel: 'qwen3.6:35b',
        temperature: 0.7,
        contextEnabled: true,
        inlineCompletionEnabled: true,
      },
      notifications: [],
      installedExtensions: [],
      isDevServerRunning: false,
      gitInSync: true,
      lastCommitHash: '8f2a1c7',
      hasShownWelcome: false,
      streamingMessageId: null,
      abortController: null,
      recentTerminalOutput: '',
      gitDiff: '',
      selectedCode: '',
      pendingFileGen: null,
      lastRecovery: null,
      sessionStartTime: Date.now(),

      setFile: (p) => set((s) => {
        s.currentFile = p;
        if (p && !s.openFiles.includes(p)) {
          s.openFiles.push(p);
        }
      }),
      setWorkspace: (id) => set((s) => {
        if (s.workspaceId !== id) {
          s.workspaceId = id;
          if (!s.chatHistories[id]) {
            s.chatHistories[id] = [
              { id: genId(), role: 'assistant', text: 'Hello! I am your Local AI Engineer. Welcome to this project.', timestamp: Date.now() }
            ];
          }
          s.notifications.push({ id: genId(), message: `Switched to workspace: ${id}`, type: 'info' });
        }
      }),
      pushChat: (msg) => set((s) => {
        if (!s.chatHistories[s.workspaceId]) s.chatHistories[s.workspaceId] = [];
        s.chatHistories[s.workspaceId].push(msg);
      }),
      updateStreamingMessage: (id, token) => set((s) => {
        const chat = s.chatHistories[s.workspaceId];
        if (!chat) return;
        const msg = chat.find(m => m.id === id);
        if (msg) {
          msg.text += token;
        }
      }),
      finalizeStreamingMessage: (id) => set((s) => {
        const chat = s.chatHistories[s.workspaceId];
        if (!chat) return;
        const msg = chat.find(m => m.id === id);
        if (msg) {
          msg.isStreaming = false;
        }
        s.streamingMessageId = null;
      }),
      clearChat: () => set((s) => {
        s.chatHistories[s.workspaceId] = [
          { id: genId(), role: 'assistant', text: 'Hello! I am your Local AI Engineer. Chat history cleared.', timestamp: Date.now() }
        ];
      }),
      deleteMessage: (id) => set((s) => {
        const chat = s.chatHistories[s.workspaceId];
        if (!chat) return;
        const idx = chat.findIndex(m => m.id === id);
        if (idx !== -1) chat.splice(idx, 1);
      }),
      editMessage: (id, newText) => set((s) => {
        const chat = s.chatHistories[s.workspaceId];
        if (!chat) return;
        const msg = chat.find(m => m.id === id);
        if (msg) msg.text = newText;
      }),
      setAgentStatus: (status) => set((state) => { state.agentStatus = status; }),
      addAgentLog: (msg, type = 'info') => set((s) => {
        const id = genId();
        s.agentLogs.unshift({ id, type, message: msg, timestamp: Date.now() });
        if (s.agentLogs.length > 100) s.agentLogs.pop();
      }),
      setAgentPlan: (plan) => set((s) => { s.agentPlan = plan; }),
      updateAgentTask: (taskId, updates) => set((s) => {
        if (!s.agentPlan) return;
        const task = s.agentPlan.tasks.find(t => t.id === taskId);
        if (task) Object.assign(task, updates);
      }),
      updateSetting: (key, value) => set((state) => { state.settings[key] = value as never; }),
      addNotification: (message, type = 'info') => set((state) => {
        state.notifications.push({ id: genId(), message, type });
      }),
      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),
      installExtension: (id) => set((s) => {
        if (!s.installedExtensions.includes(id)) {
          s.installedExtensions.push(id);
          s.notifications.push({ id: genId(), message: `Extension installed: ${id}`, type: 'success' });
        }
      }),
      uninstallExtension: (id) => set((s) => {
        s.installedExtensions = s.installedExtensions.filter(e => e !== id);
        s.notifications.push({ id: genId(), message: `Extension uninstalled: ${id}`, type: 'info' });
      }),
      addFile: (file) => set((s) => {
        if (!s.files.find(f => f.name === file.name)) {
          s.files.push({ ...file, isDirty: false, savedContent: file.content });
          s.agentLogs.unshift({ id: genId(), type: 'success', message: `Created new file: ${file.name}`, timestamp: Date.now() });
        }
        s.currentFile = file.name;
        if (!s.openFiles.includes(file.name)) {
          s.openFiles.push(file.name);
        }
      }),
      closeFile: (name) => set((s) => {
        s.openFiles = s.openFiles.filter(f => f !== name);
        if (s.currentFile === name) {
          s.currentFile = s.openFiles[s.openFiles.length - 1] || s.files[0]?.name || null;
        }
      }),
      updateFile: (name, content) => set((s) => {
        const file = s.files.find(f => f.name === name);
        if (file) {
          file.content = content;
          file.isDirty = content !== file.savedContent;
        }
      }),
      markFileDirty: (name, dirty) => set((s) => {
        const file = s.files.find(f => f.name === name);
        if (file) {
          file.isDirty = dirty;
          if (!dirty) file.savedContent = file.content;
        }
      }),
      deleteFile: (name) => set((s) => {
        s.files = s.files.filter(f => f.name !== name);
        s.openFiles = s.openFiles.filter(f => f !== name);
        if (s.currentFile === name) {
          s.currentFile = s.openFiles[s.openFiles.length - 1] || s.files[0]?.name || null;
        }
        s.agentLogs.unshift({ id: genId(), type: 'warning', message: `Deleted file: ${name}`, timestamp: Date.now() });
      }),
      renameFile: (oldName, newName) => set((s) => {
        const file = s.files.find(f => f.name === oldName);
        if (file) {
          file.name = newName;
          if (s.currentFile === oldName) s.currentFile = newName;
          const openIndex = s.openFiles.indexOf(oldName);
          if (openIndex !== -1) s.openFiles[openIndex] = newName;
          s.agentLogs.unshift({ id: genId(), type: 'info', message: `Renamed ${oldName} to ${newName}`, timestamp: Date.now() });
        }
      }),
      toggleDevServer: () => set((s) => {
        s.isDevServerRunning = !s.isDevServerRunning;
        const msg = s.isDevServerRunning ? 'Dev server started on port 3000' : 'Dev server stopped';
        const type = s.isDevServerRunning ? 'success' : 'warning';
        s.notifications.push({ id: genId(), message: msg, type });
        s.agentLogs.unshift({ id: genId(), type, message: msg, timestamp: Date.now() });
      }),
      syncGit: () => set((s) => {
        s.gitInSync = true;
        s.lastCommitHash = Math.random().toString(16).substring(2, 9);
        s.notifications.push({ id: genId(), message: 'Source Control: Synced with local origin', type: 'success' });
        s.agentLogs.unshift({ id: genId(), type: 'success', message: `Pushed commit ${s.lastCommitHash} to origin`, timestamp: Date.now() });
      }),
      setHasShownWelcome: (v) => set((s) => { s.hasShownWelcome = v; }),
      fetchFiles: async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/files`);
          const diskFiles = await Promise.all(res.data.map(async (f: { is_dir: boolean; name: string }) => {
            if (f.is_dir) return null;
            const contentRes = await axios.get(`${BACKEND_URL}/api/file-content`, { params: { path: f.name } });
            return { name: f.name, content: contentRes.data.content, isDirty: false, savedContent: contentRes.data.content };
          }));
          set((s) => {
            s.files = diskFiles.filter(Boolean) as IDEFile[];
          });
        } catch (e) {
          console.error("Failed to fetch files from desktop core", e);
        }
      },
      saveFileToDisk: async (name, content) => {
        try {
          await axios.post(`${BACKEND_URL}/api/save-file`, { path: name, content });
          set((s) => {
            const file = s.files.find(f => f.name === name);
            if (file) {
              file.isDirty = false;
              file.savedContent = content;
            }
          });
        } catch (e) {
          console.error("Failed to save to disk", e);
        }
      },
      checkOllama: async () => {
        set((s) => { s.ollamaStatus = 'checking'; });
        try {
          const models = await fetchModels();
          if (models.length >= 0) {
            set((s) => {
              const wasDisconnected = s.ollamaStatus !== 'connected';
              s.ollamaStatus = 'connected';
              s.localModels = models;
              if (wasDisconnected) {
                s.notifications.push({ id: genId(), message: `Connected to Local Ollama Instance`, type: 'success' });
              }
              if (s.localModels.length > 0 && (!s.settings.aiModel || !s.localModels.find(m => m.name === s.settings.aiModel))) {
                s.settings.aiModel = s.localModels[0].name;
              }
            });
          }
        } catch {
          set((s) => {
            if (s.ollamaStatus !== 'disconnected') {
              s.notifications.push({ id: genId(), message: `Failed to connect to Ollama`, type: 'error' });
            }
            s.ollamaStatus = 'disconnected';
            s.localModels = [];
          });
        }
      },
      setAbortController: (controller) => set((s) => { s.abortController = controller; }),
      setStreamingMessageId: (id) => set((s) => { s.streamingMessageId = id; }),
      setRecentTerminalOutput: (output) => set((s) => { s.recentTerminalOutput = output; }),
      setGitDiff: (diff) => set((s) => { s.gitDiff = diff; }),
      setSelectedCode: (code) => set((s) => { s.selectedCode = code; }),
      setPendingFileGen: (req) => set((s) => { s.pendingFileGen = req; }),
      saveRecovery: () => set((s) => {
        s.lastRecovery = {
          files: s.files.filter(f => f.isDirty).map(f => ({ name: f.name, content: f.content })),
          openFiles: [...s.openFiles],
          currentFile: s.currentFile,
          chatHistories: s.chatHistories,
          timestamp: Date.now(),
        };
      }),
      restoreFromRecovery: () => {
        const state = get();
        if (!state.lastRecovery) return false;
        set((s) => {
          for (const rf of s.lastRecovery!.files) {
            const existing = s.files.find(f => f.name === rf.name);
            if (existing) {
              existing.content = rf.content;
              existing.isDirty = true;
            } else {
              s.files.push({ name: rf.name, content: rf.content, isDirty: true });
            }
          }
          s.openFiles = s.lastRecovery!.openFiles;
          s.currentFile = s.lastRecovery!.currentFile;
          s.notifications.push({ id: genId(), message: 'Session restored from recovery data', type: 'success' });
        });
        return true;
      },
    })),
    {
      name: 'local-ai-ide-storage',
      partialize: (state) => ({
        chatHistories: state.chatHistories,
        workspaceId: state.workspaceId,
        settings: state.settings,
        files: state.files,
        openFiles: state.openFiles,
        installedExtensions: state.installedExtensions,
        hasShownWelcome: state.hasShownWelcome,
        lastRecovery: state.lastRecovery,
        sessionStartTime: state.sessionStartTime,
      }),
    }
  )
);

// Auto-save recovery data periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useIDEStore.getState();
    if (state.files.some(f => f.isDirty)) {
      state.saveRecovery();
    }
  }, 30000);

  window.addEventListener('beforeunload', () => {
    useIDEStore.getState().saveRecovery();
  });
}
