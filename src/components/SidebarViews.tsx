
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
  Code2,
  Trash2,
  Plus,
  Globe,
  X
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
      <div className="px-4 py-2 flex flex-col gap-2">
        <div className="relative">
          <ChevronRight size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#3c3c3c] border border-[#454545] focus:border-ide-accent rounded px-6 py-1 text-xs text-white outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <ChevronRight size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Replace" 
            className="w-full bg-[#3c3c3c] border border-[#454545] focus:border-ide-accent rounded px-6 py-1 text-xs text-white outline-none"
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
  const { activeExtensions, installedExtensions, installExtension, uninstallExtension } = useIDEStore();
  const [search, setSearch] = useState('');

  const marketplace = [
    { id: 'eslint', name: 'ESLint', author: 'Microsoft', desc: 'Integrates ESLint into VS Code.', version: '2.4.4', rating: '4.5' },
    { id: 'docker', name: 'Docker', author: 'Microsoft', desc: 'Makes it easy to create, manage, and debug containerized applications.', version: '1.29.1', rating: '4.8' },
    { id: 'copilot', name: 'GitHub Copilot', author: 'GitHub', desc: 'Your AI pair programmer.', version: '1.25.0', rating: '4.9' },
    { id: 'vim', name: 'Vim', author: 'vscodevim', desc: 'Vim emulation for Visual Studio Code.', version: '1.27.3', rating: '4.3' }
  ].filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const allActive = [...activeExtensions, ...installedExtensions];

  return (
    <div className="flex flex-col h-full bg-[#252526]">
       <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Extensions</div>
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
          <div className="px-4 py-2 text-[10px] uppercase text-gray-400 font-bold bg-[#333333] sticky top-0 z-10">Installed ({allActive.length})</div>
          {allActive.map(ext => (
            <div key={ext} className="px-4 py-3 border-b border-ide-border hover:bg-[#2a2d2e] cursor-pointer flex gap-3 group">
              <div className="w-8 h-8 bg-ide-accent/20 rounded flex items-center justify-center text-ide-accent group-hover:bg-ide-accent/30">
                <Blocks size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{ext}</div>
                <div className="text-[10px] text-gray-500">v1.2.3 • Enabled</div>
              </div>
              {installedExtensions.includes(ext) && (
                  <button 
                  onClick={(e) => { e.stopPropagation(); uninstallExtension(ext); }}
                  className="text-gray-500 hover:text-red-400 p-1" title="Uninstall"
                  >
                      <Trash2 size={14} />
                  </button>
              )}
              <Settings size={14} className="text-gray-500 hover:text-white self-center" />
            </div>
          ))}

          <div className="px-4 py-2 text-[10px] uppercase text-gray-400 font-bold bg-[#333333] sticky top-0 z-10 mt-2">Recommended</div>
          {marketplace.filter(m => !allActive.includes(m.name)).map(ext => (
            <div key={ext.name} className="px-4 py-3 border-b border-ide-border hover:bg-[#2a2d2e] cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-blue-400 group-hover:text-blue-300">{ext.name}</div>
                <button 
                    onClick={() => installExtension(ext.name)}
                    className="px-2 py-0.5 bg-ide-accent text-white text-[10px] rounded hover:bg-blue-600 transition-colors"
                >
                    Install
                </button>
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
    const { stableMetrics: metrics, agentLogs: logs, isDevServerRunning } = useIDEStore();

    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-4 border-b border-ide-border bg-[#1e1e1e]">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">Stability Engine Active</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-4 italic">Autonomous Monitoring & Self-Healing</div>
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#252526] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase font-bold">Health Score</div>
                        <div className="text-xl font-bold text-green-400">99.8%</div>
                    </div>
                    <div className="bg-[#252526] p-2 rounded border border-ide-border">
                        <div className="text-[9px] text-gray-500 uppercase font-bold">Host {metrics.cpu}</div>
                        <div className="text-[10px] text-white">RAM: {metrics.memory}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="text-[11px] font-bold text-gray-500 uppercase mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity size={14} />
                      Live Diagnostics
                    </div>
                    <span className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded text-[8px] animate-pulse">MONITORING</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Process Stability</span>
                        <span className="text-green-400 font-mono">READY</span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] h-1 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[100%] transition-all duration-1000"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Dev Server Connection</span>
                        <span className={isDevServerRunning ? "text-blue-400 font-mono" : "text-gray-600 font-mono"}>{isDevServerRunning ? 'STABLE' : 'IDLE'}</span>
                    </div>
                    <div className="w-full bg-[#3c3c3c] h-1 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${isDevServerRunning ? 'bg-blue-500 w-[94%]' : 'bg-gray-600 w-0'}`}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-6">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase">Recovery Event Log</h3>
                    {logs.slice(0, 3).map(log => (
                      <div key={log.id} className="text-[10px] p-2 bg-[#1e1e1e] rounded border-l-2 border-blue-500">
                          <div className="text-gray-300 font-semibold">{log.message}</div>
                          <div className="text-gray-600 text-[9px]">{new Date(log.timestamp).toLocaleTimeString()} • Auto-Resolved</div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>
    );
};

export const SourceView = () => {
    const { gitInSync, syncGit, lastCommitHash } = useIDEStore();

    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Source Control</div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-4">
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="text-xs font-bold text-white mb-2">Project Repository</div>
                        <div className="text-[10px] text-gray-500 font-mono mb-3">.git initialized</div>
                        <div className="flex items-center justify-between mb-3 text-[10px] bg-black/30 p-1 rounded">
                            <span className="text-gray-400">Current Commit:</span>
                            <span className="text-ide-accent font-bold">{lastCommitHash}</span>
                        </div>
                        <button className="w-full py-1.5 bg-[#333] hover:bg-[#444] text-white text-[11px] font-bold rounded border border-ide-border transition-colors">
                            VIEW COMMIT HISTORY
                        </button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="text-[10px] uppercase text-gray-400 font-bold">Changes</div>
                        {!gitInSync ? (
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">M</span>
                                        <span className="text-gray-300">src/App.tsx</span>
                                    </div>
                                    <Plus size={10} className="text-gray-500" />
                                </div>
                                <div className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-500">A</span>
                                        <span className="text-gray-300">src/components/NewFeature.tsx</span>
                                    </div>
                                    <Plus size={10} className="text-gray-500" />
                                </div>
                             </div>
                        ) : (
                            <div className="text-xs text-gray-500 italic py-8 text-center bg-[#1e1e1e] rounded border border-dashed border-ide-border">
                                No uncommitted changes detected. System is in sync.
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => syncGit()}
                        className="w-full py-2 bg-ide-accent hover:bg-blue-600 text-white text-[11px] font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2 uppercase"
                    >
                        <Github size={14} /> {gitInSync ? 'Sync with Origin' : 'Commit & Push Changes'}
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
    const { isDevServerRunning, toggleDevServer } = useIDEStore();

    return (
        <div className="flex flex-col h-full bg-[#252526]">
            <div className="px-4 py-2 text-[11px] uppercase text-gray-500 font-bold border-b border-ide-border py-4 mb-2">Run & Debug</div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => toggleDevServer()}
                        className={`w-full py-2.5 text-white text-[11px] font-bold rounded shadow-lg transition-colors flex items-center justify-center gap-2 ${isDevServerRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {isDevServerRunning ? <><X size={14} /> STOP DEV SERVER</> : <><Terminal size={14} /> LAUNCH DEV SERVER</>}
                    </button>
                    
                    <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                        <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">Active Processes</div>
                        <div className="flex flex-col gap-1">
                            {isDevServerRunning ? (
                                <>
                                    <div className="flex items-center justify-between py-1 border-b border-[#333]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-gray-200">vite (dev)</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 font-mono">PID: 4521</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-gray-200">tsc --watch</span>
                                        </div>
                                        <span className="text-[9px] text-gray-500 font-mono">PID: 4522</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-[10px] text-gray-500 italic py-2 text-center">No processes running</div>
                            )}
                        </div>
                    </div>

                    {isDevServerRunning && (
                        <div className="bg-[#1e1e1e] p-3 rounded border border-ide-border">
                            <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">Network</div>
                            <div className="flex flex-col gap-1">
                                <div className="text-[10px] text-ide-accent hover:underline cursor-pointer">http://localhost:3000</div>
                                <div className="text-[10px] text-gray-500">http://192.168.1.15:3000</div>
                            </div>
                        </div>
                    )}
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
