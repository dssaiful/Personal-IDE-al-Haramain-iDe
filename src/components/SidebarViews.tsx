
import React, { useState } from 'react';
import { 
  Search, 
  Settings, 
  Cpu, 
  Blocks, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight,
  Download,
  Github,
  Zap,
  Activity,
  Server,
  Cloud,
  Terminal,
  BookOpen,
  Code2
} from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';

export const SearchView = () => {
  const [query, setQuery] = useState('');
  const files = useIDEStore(s => s.files);
  const setFile = useIDEStore(s => s.setFile);

  const results = query.length > 1 
    ? files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.content.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full bg-[#252526]">
      <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold">Search Across Project</div>
      <div className="px-4 py-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search text or filenames..." 
            className="w-full bg-[#3c3c3c] border border-transparent focus:border-ide-accent rounded px-8 py-1.5 text-xs text-white outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {query.length > 1 && results.length === 0 && (
          <div className="text-xs text-gray-500 italic">No results found for "{query}"</div>
        )}
        {results.map(f => (
          <div 
            key={f.name}
            onClick={() => setFile(f.name)}
            className="group py-2 px-2 hover:bg-[#2a2d2e] cursor-pointer rounded transition-colors"
          >
            <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">{f.name}</div>
            <div className="text-[10px] text-gray-500 truncate mt-0.5">
              {f.content.substring(0, 100).replace(/\n/g, ' ')}...
            </div>
          </div>
        ))}
        {query.length <= 1 && (
          <div className="text-xs text-gray-500 flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" />
              <span>Type at least 2 characters to search</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-bold uppercase">Recent Searches</div>
              <div className="hover:text-gray-300 cursor-pointer">handleNewFile</div>
              <div className="hover:text-gray-300 cursor-pointer">ideStore</div>
              <div className="hover:text-gray-300 cursor-pointer">theme-variable</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ExtensionsView = () => {
  const activeExtensions = useIDEStore(s => s.activeExtensions);
  const [search, setSearch] = useState('');

  const marketplace = [
    { name: 'ESLint', author: 'Microsoft', desc: 'Integrates ESLint into VS Code.', version: '2.4.4', rating: '4.5' },
    { name: 'Docker', author: 'Microsoft', desc: 'Makes it easy to create, manage, and debug containerized applications.', version: '1.29.1', rating: '4.8' },
    { name: 'GitHub Copilot', author: 'GitHub', desc: 'Your AI pair programmer.', version: '1.25.0', rating: '4.9' },
    { name: 'Vim', author: 'vscodevim', desc: 'Vim emulation for Visual Studio Code.', version: '1.27.3', rating: '4.3' }
  ].filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#252526]">
       <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold">Extensions</div>
       <div className="px-4 py-2">
         <input 
            type="text" 
            placeholder="Search Marketplace..." 
            className="w-full bg-[#3c3c3c] border border-transparent focus:border-ide-accent rounded px-3 py-1.5 text-xs text-white outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
       </div>
       <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-[10px] uppercase text-gray-400 font-bold bg-[#333333] sticky top-0 z-10">Installed</div>
          {activeExtensions.map(ext => (
            <div key={ext} className="px-4 py-3 border-b border-ide-border hover:bg-[#2a2d2e] cursor-pointer flex gap-3">
              <div className="w-8 h-8 bg-ide-accent/20 rounded flex items-center justify-center text-ide-accent">
                <Blocks size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{ext}</div>
                <div className="text-[10px] text-gray-500">v1.2.3 • IDE Built-in</div>
              </div>
              <Settings size={14} className="text-gray-500 hover:text-white" />
            </div>
          ))}

          <div className="px-4 py-2 text-[10px] uppercase text-gray-400 font-bold bg-[#333333] sticky top-0 z-10 mt-2">Recommended</div>
          {marketplace.map(ext => (
            <div key={ext.name} className="px-4 py-3 border-b border-ide-border hover:bg-[#2a2d2e] cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">{ext.name}</div>
                <button className="px-2 py-0.5 bg-ide-accent text-white text-[10px] rounded hover:bg-blue-600">Install</button>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{ext.desc}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] text-gray-500 font-medium">{ext.author}</span>
                <span className="text-[9px] text-yellow-500">★ {ext.rating}</span>
              </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export const StabilityView = () => {
    const metrics = useIDEStore(s => s.stableMetrics);
    const logs = useIDEStore(s => s.agentLogs);

    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-4 border-b border-ide-border">
                <div className="flex items-center gap-2 text-green-400 mb-4">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">Stability Engine Active</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1e1e1e] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase">Host CPU</div>
                        <div className="text-sm font-bold text-blue-400">{metrics.cpu}</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase">RAM Usage</div>
                        <div className="text-sm font-bold text-blue-400">{metrics.memory}</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase">AI Latency</div>
                        <div className="text-sm font-bold text-purple-400">{metrics.latency}</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase">Task Uptime</div>
                        <div className="text-sm font-bold text-green-400">{metrics.uptime}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="text-[11px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Activity size={14} />
                    Live Stability Stream
                </div>
                <div className="flex flex-col gap-2">
                    {logs.map(log => (
                        <div key={log.id} className="text-[10px] leading-relaxed border-l border-ide-border pl-3 pb-2 last:pb-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className={`font-bold ${log.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {log.type.toUpperCase()}
                                </span>
                                <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-gray-300">{log.message}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SourceView = () => {
    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Source Control</div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-4">
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="text-xs font-bold text-white mb-2">Project Repository</div>
                        <div className="text-[10px] text-gray-500 font-mono mb-3">.git initialized</div>
                        <button className="w-full py-1.5 bg-[#333] hover:bg-[#444] text-white text-[11px] font-bold rounded border border-ide-border transition-colors">
                            VIEW COMMIT HISTORY
                        </button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="text-[10px] uppercase text-gray-400 font-bold">Pending Changes</div>
                        <div className="text-xs text-gray-500 italic py-8 text-center bg-[#1e1e1e] rounded border border-dashed border-ide-border">
                            No uncommitted changes detected. System is in sync.
                        </div>
                    </div>
                    
                    <button className="w-full py-2 bg-ide-accent hover:bg-blue-600 text-white text-[11px] font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                        <Github size={14} /> PUSH TO LOCAL ORIGIN
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BrowserView = () => {
    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Browser Subagent</div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-4">
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-bold text-white uppercase tracking-tighter">Live Web Inspector</div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                        <div className="bg-[#252526] p-2 rounded border border-ide-border mb-3 flex items-center gap-2">
                            <Globe size={12} className="text-gray-500" />
                            <span className="text-[10px] text-gray-300 truncate">http://localhost:3000</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="py-1 bg-[#333] hover:bg-[#444] text-[10px] text-white rounded border border-ide-border font-bold">SCREENSHOT</button>
                            <button className="py-1 bg-[#333] hover:bg-[#444] text-[10px] text-white rounded border border-ide-border font-bold">DUMP DOM</button>
                        </div>
                    </div>

                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">Active Interactions</div>
                        <div className="flex flex-col gap-2">
                            <div className="text-[10px] text-green-400 bg-green-400/5 p-1 rounded">✓ Page Loaded Successfully</div>
                            <div className="text-[10px] text-blue-400 bg-blue-400/5 p-1 rounded">ℹ Running lighthouse scan...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RunView = () => {
    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Run & Debug</div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-4">
                    <button className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2">
                        <Terminal size={14} /> LAUNCH DEV SERVER
                    </button>
                    
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">Active Processes</div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between py-1 border-b border-[#333]">
                                <span className="text-[10px] text-gray-200">vite (dev)</span>
                                <span className="text-[9px] text-gray-500">PID: 4521</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-[10px] text-gray-200">tsc --watch</span>
                                <span className="text-[9px] text-gray-500">PID: 4522</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SettingsView = () => {
    const { settings, updateSetting, addNotification } = useIDEStore();

    const handleExport = () => {
        addNotification("Packaging application into ZIP...", 'info');
        setTimeout(() => {
            addNotification("Project ready for local EXE build!", 'success');
        }, 2000);
    };

    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border mb-4 py-4">IDE Settings</div>
            
            <div className="px-4 flex flex-col gap-6 overflow-y-auto pb-8">
                <section>
                    <div className="text-xs font-bold text-ide-accent mb-3 uppercase tracking-tighter">AI Assistant</div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">Predictive Edits</span>
                            <input 
                                type="checkbox" 
                                checked={settings.autoApplyDiffs}
                                onChange={(e) => updateSetting('autoApplyDiffs', e.target.checked)}
                                className="w-4 h-4 accent-ide-accent"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-300">Inference Engine</span>
                            <select 
                                value={settings.aiModel}
                                onChange={(e) => updateSetting('aiModel', e.target.value)}
                                className="bg-[#3c3c3c] text-xs text-white p-1.5 rounded outline-none border border-transparent focus:border-ide-accent"
                            >
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
                                <option value="gemini-2.0-pro">Gemini 2.0 Pro (Complex tasks)</option>
                                <option value="deepseek-v3">DeepSeek V3 (Reasoning)</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="text-xs font-bold text-green-400 mb-3 uppercase tracking-tighter">Distribution & Build</div>
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border flex flex-col gap-3">
                        <div className="text-[11px] text-gray-300 leading-relaxed">
                            To run this IDE locally as a high-performance <strong>.exe</strong> file, use the "Export as EXE" feature.
                        </div>
                        <button 
                            onClick={handleExport}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors"
                        >
                            <Download size={14} />
                            EXPORT AS LOCAL EXE
                        </button>
                        <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500">
                            <Github size={12} />
                            Requires VS Build Tools
                        </div>
                    </div>
                </section>

                <section>
                    <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-tighter">System Info</div>
                    <div className="flex flex-col gap-2 text-[10px] text-gray-500 font-mono">
                        <div className="flex justify-between border-b border-[#333] pb-1">
                            <span>Version:</span>
                            <span>v1.0.4-beta</span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-1">
                            <span>Commit:</span>
                            <span>8f2a1c7</span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-1">
                            <span>OS:</span>
                            <span>Windows x64 Build</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sandbox:</span>
                            <span>Enabled</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
