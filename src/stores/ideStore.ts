import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool';
  text: string;
  images?: string[];
  files?: string[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface IDEFile {
  name: string;
  content: string;
}

export interface AgentLog {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

interface IDEState {
  currentFile: string | null;
  files: IDEFile[];
  openFiles: string[]; // List of names of open files (tabs)
  
  workspaceId: string;
  chatHistories: Record<string, ChatMessage[]>;
  
  agentStatus: 'idle' | 'planning' | 'executing' | 'retrying' | 'done';
  agentLogs: AgentLog[];
  stableMetrics: {
    cpu: string;
    memory: string;
    latency: string;
    uptime: string;
  };
  activeExtensions: string[];
  ollamaStatus: 'checking' | 'connected' | 'disconnected';
  localModels: { name: string; size: number }[];
  settings: {
    autoApplyDiffs: boolean;
    confirmToolCalls: boolean;
    aiModel: string;
  };
  notifications: Notification[];
  installedExtensions: string[];
  isDevServerRunning: boolean;
  gitInSync: boolean;
  lastCommitHash: string;
  hasShownWelcome: boolean;
  
  setFile: (p: string) => void;
  setWorkspace: (id: string) => void;
  pushChat: (msg: ChatMessage) => void;
  clearChat: () => void;
  setAgentStatus: (s: IDEState['agentStatus']) => void;
  addAgentLog: (msg: string, type?: AgentLog['type']) => void;
  updateSetting: <K extends keyof IDEState['settings']>(key: K, value: IDEState['settings'][K]) => void;
  checkOllama: () => Promise<void>;
  addNotification: (message: string, type?: Notification['type']) => void;
  removeNotification: (id: string) => void;
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
  addFile: (file: IDEFile) => void;
  closeFile: (name: string) => void;
  updateFile: (name: string, content: string) => void;
  deleteFile: (name: string) => void;
  renameFile: (oldName: string, newName: string) => void;
  toggleDevServer: () => void;
  syncGit: () => void;
  setHasShownWelcome: (v: boolean) => void;
}

export const useIDEStore = create<IDEState>()(
  persist(
    immer((set) => ({
      currentFile: 'main.py',
      files: [
        { name: 'main.py', content: 'print("Hello from Local AI IDE!")\n\n# Autonomous Self-Healing Activated\ndef repair_system(): \n    print("Scanning for errors...")' },
        { name: 'App.tsx', content: 'import React from "react";\n\nexport default function App() {\n  return <div>Welcome to Autonomous IDE</div>;\n}' },
        { name: 'package.json', content: '{\n  "name": "autonomous-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "18.2.0"\n  }\n}' },
        { name: 'README.md', content: '# Autonomous IDE Project\n\nThis project is managed by a Senior AI Engineer.' },
        { name: 'index.css', content: 'body { margin: 0; background: #000; color: #fff; }' }
      ],
      openFiles: ['main.py', 'App.tsx', 'README.md'],
      workspaceId: 'default-project',
      chatHistories: {
        'default-project': [
          { role: 'assistant', text: 'Hello! I am your Local AI Engineer running on Ollama. How can I help you code today?' }
        ]
      },
      agentStatus: 'idle',
      agentLogs: [
        { id: '1', type: 'info', message: 'Autonomous Engine Initialized', timestamp: Date.now() }
      ],
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
      },
      notifications: [],
      installedExtensions: [],
      isDevServerRunning: false,
      gitInSync: true,
      lastCommitHash: '8f2a1c7',
      hasShownWelcome: false,
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
              { role: 'assistant', text: 'Hello! I am your Local AI Engineer. Welcome to this project.' }
            ];
          }
          const notfId = Math.random().toString(36).substring(2, 9);
          s.notifications.push({ id: notfId, message: `Switched to workspace: ${id}`, type: 'info' });
        }
      }),
      pushChat: (msg) => set((s) => { 
        if (!s.chatHistories[s.workspaceId]) s.chatHistories[s.workspaceId] = [];
        s.chatHistories[s.workspaceId].push(msg); 
      }),
      clearChat: () => set((s) => {
        s.chatHistories[s.workspaceId] = [
          { role: 'assistant', text: 'Hello! I am your Local AI Engineer. Chat history cleared.' }
        ];
      }),
      setAgentStatus: (s) => set((state) => { state.agentStatus = s; }),
      addAgentLog: (msg, type = 'info') => set((s) => {
        const id = Math.random().toString(36).substring(2, 9);
        s.agentLogs.unshift({ id, type, message: msg, timestamp: Date.now() });
        if (s.agentLogs.length > 50) s.agentLogs.pop();
      }),
      updateSetting: (key, value) => set((state) => { state.settings[key] = value as any; }),
      addNotification: (message, type = 'info') => set((state) => {
        const id = Math.random().toString(36).substring(2, 9);
        state.notifications.push({ id, message, type });
      }),
      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),
      installExtension: (id) => set((s) => {
        if (!s.installedExtensions.includes(id)) {
          s.installedExtensions.push(id);
          const notfId = Math.random().toString(36).substring(2, 9);
          s.notifications.push({ id: notfId, message: `Extension installed: ${id}`, type: 'success' });
        }
      }),
      uninstallExtension: (id) => set((s) => {
        s.installedExtensions = s.installedExtensions.filter(e => e !== id);
        const notfId = Math.random().toString(36).substring(2, 9);
        s.notifications.push({ id: notfId, message: `Extension uninstalled: ${id}`, type: 'info' });
      }),
      addFile: (file) => set((s) => {
        if (!s.files.find(f => f.name === file.name)) {
          s.files.push(file);
          const id = Math.random().toString(36).substring(2, 9);
          s.agentLogs.unshift({ id, type: 'success', message: `Created new file: ${file.name}`, timestamp: Date.now() });
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
        }
      }),
      deleteFile: (name) => set((s) => {
        s.files = s.files.filter(f => f.name !== name);
        s.openFiles = s.openFiles.filter(f => f !== name);
        if (s.currentFile === name) {
          s.currentFile = s.openFiles[s.openFiles.length - 1] || s.files[0]?.name || null;
        }
        const id = Math.random().toString(36).substring(2, 9);
        s.agentLogs.unshift({ id, type: 'warning', message: `Deleted file: ${name}`, timestamp: Date.now() });
      }),
      renameFile: (oldName, newName) => set((s) => {
        const file = s.files.find(f => f.name === oldName);
        if (file) {
          file.name = newName;
          if (s.currentFile === oldName) s.currentFile = newName;
          const openIndex = s.openFiles.indexOf(oldName);
          if (openIndex !== -1) s.openFiles[openIndex] = newName;
          const id = Math.random().toString(36).substring(2, 9);
          s.agentLogs.unshift({ id, type: 'info', message: `Renamed ${oldName} to ${newName}`, timestamp: Date.now() });
        }
      }),
      toggleDevServer: () => set((s) => {
        s.isDevServerRunning = !s.isDevServerRunning;
        const msg = s.isDevServerRunning ? 'Dev server started on port 3000' : 'Dev server stopped';
        const type = s.isDevServerRunning ? 'success' : 'warning';
        const id = Math.random().toString(36).substring(2, 9);
        s.notifications.push({ id, message: msg, type });
        s.agentLogs.unshift({ id, type, message: msg, timestamp: Date.now() });
      }),
      syncGit: () => set((s) => {
        s.gitInSync = true;
        s.lastCommitHash = Math.random().toString(16).substring(2, 9);
        const id = Math.random().toString(36).substring(2, 9);
        s.notifications.push({ id, message: 'Source Control: Synced with local origin', type: 'success' });
        s.agentLogs.unshift({ id, type: 'success', message: `Pushed commit ${s.lastCommitHash} to origin`, timestamp: Date.now() });
      }),
      setHasShownWelcome: (v: boolean) => set((s) => {
        s.hasShownWelcome = v;
      }),
      checkOllama: async () => {
        set((s) => { s.ollamaStatus = 'checking'; });
        try {
          const res = await fetch('http://127.0.0.1:11434/api/tags');
          if (res.ok) {
            const data = await res.json();
            set((s) => { 
              if (s.ollamaStatus !== 'connected') {
                const id = Math.random().toString(36).substring(2, 9);
                s.notifications.push({ id, message: `Connected to Local Ollama Instance`, type: 'success' });
              }
              s.ollamaStatus = 'connected'; 
              s.localModels = data.models || [];
              // Auto-select the first available model if current is not in list
              if (s.localModels.length > 0 && (!s.settings.aiModel || !s.localModels.find(m => m.name === s.settings.aiModel))) {
                s.settings.aiModel = s.localModels[0].name;
              }
            });
          } else {
            set((s) => { 
              if (s.ollamaStatus !== 'disconnected') {
                const id = Math.random().toString(36).substring(2, 9);
                s.notifications.push({ id, message: `Ollama is Disconnected`, type: 'error' });
              }
              s.ollamaStatus = 'disconnected'; 
            });
          }
        } catch (error) {
          // Fallback for web preview purposes
          set((s) => { 
            if (s.ollamaStatus !== 'disconnected') {
              const id = Math.random().toString(36).substring(2, 9);
              s.notifications.push({ id, message: `Failed to connect to Ollama`, type: 'error' });
            }
            s.ollamaStatus = 'disconnected'; 
            s.localModels = [];
          });
        }
      }
    })),
    {
      name: 'local-ai-ide-storage',
      partialize: (state) => ({ 
        chatHistories: state.chatHistories, 
        workspaceId: state.workspaceId,
        settings: state.settings,
        files: state.files,
        openFiles: state.openFiles,
        installedExtensions: state.installedExtensions
      }),
    }
  )
);
