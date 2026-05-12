import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useIDEStore } from './stores/ideStore';
import { TopMenuBar } from './components/TopMenuBar';
import { WelcomeAnimation } from './components/WelcomeAnimation';
import { ToastManager } from './components/ToastManager';
import { SearchView, ExtensionsView, StabilityView, SettingsView, SourceView, BrowserView, RunView } from './components/SidebarViews';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Settings, 
  Bot,
  TerminalSquare,
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Cpu,
  Plus,
  MoreHorizontal,
  Download,
  AlertCircle,
  CheckCircle2,
  Zap,
  BookOpen,
  Code2,
  Database,
  Blocks,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Globe,
  ListTree,
  ShieldCheck,
  ListTodo,
  MoreVertical,
  Check,
  Bell
} from 'lucide-react';

const artifactsFile = [
  { name: 'task_plan_01.md', type: 'doc' },
  { name: 'error_screenshot.png', type: 'img' },
  { name: 'test_recording.webm', type: 'video' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [pullModelInput, setPullModelInput] = useState('');
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [terminalType, setTerminalType] = useState('powershell');
  
  // Agent mode: fast or planning
  const [agentMode, setAgentMode] = useState<'fast' | 'planning'>('fast');
  
  // Explorer accordion sections
  const [explorerSections, setExplorerSections] = useState({
    openEditors: true,
    workspace: true,
    outline: false,
    artifacts: true
  });
  const [showExplorerSettings, setShowExplorerSettings] = useState(false);
  
  const [fileContextMenu, setFileContextMenu] = useState<{x: number, y: number, file: string} | null>(null);
  const [tabContextMenu, setTabContextMenu] = useState<{x: number, y: number} | null>(null);
  const [extensionSearchQuery, setExtensionSearchQuery] = useState('');
  const [explorerSearchQuery, setExplorerSearchQuery] = useState('');
  
  // Bottom Panel state
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [bottomPanelTab, setBottomPanelTab] = useState('terminal');

  // Resize states
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  
  const [chatWidth, setChatWidth] = useState(320);
  const [isResizingChat, setIsResizingChat] = useState(false);
  
  const [bottomPanelHeight, setBottomPanelHeight] = useState(256);
  const [isResizingBottomPanel, setIsResizingBottomPanel] = useState(false);

  const { 
    chatHistories, workspaceId, pushChat, settings, updateSetting, 
    ollamaStatus, localModels, checkOllama, setWorkspace, addNotification, 
    installedExtensions, installExtension, uninstallExtension,
    files, currentFile, setFile, addFile, updateFile, deleteFile, renameFile, agentLogs, addAgentLog,
    openFiles, closeFile, isDevServerRunning
  } = useIDEStore();

  const selectedFileObject = files.find(f => f.name === currentFile) || files[0] || { name: 'untitled.txt', content: '' };
  
  const handleNewFile = () => {
    const fileName = prompt("Enter file name:", "new_file.txt");
    if (fileName) {
      if (files.find(f => f.name === fileName)) {
        addNotification(`File ${fileName} already exists`, 'error');
        return;
      }
      addFile({ name: fileName, content: '' });
      addNotification(`Created ${fileName}`, 'success');
    }
  };

  const handleNewTextFile = () => {
    let index = 1;
    let fileName = `Untitled-${index}.txt`;
    while (files.find(f => f.name === fileName)) {
      index++;
      fileName = `Untitled-${index}.txt`;
    }
    addFile({ name: fileName, content: '' });
    addNotification(`Created ${fileName}`, 'success');
  };

  const handleOpenFile = () => {
    const fileName = prompt("Enter file name to open:", "main.py");
    if (fileName) {
      const file = files.find(f => f.name === fileName);
      if (file) {
        setFile(fileName);
        addNotification(`Opened ${fileName}`, 'info');
      } else {
        addNotification(`File ${fileName} not found`, 'error');
      }
    }
  };

  const handleRenameFile = (oldName: string) => {
    const newName = prompt("Enter new name:", oldName);
    if (newName && newName !== oldName) {
      if (files.find(f => f.name === newName)) {
        addNotification(`File ${newName} already exists`, 'error');
        return;
      }
      renameFile(oldName, newName);
      addNotification(`Renamed ${oldName} to ${newName}`, 'success');
    }
  };

  const handleDeleteFile = (fileName: string) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      deleteFile(fileName);
      addNotification(`Deleted ${fileName}`, 'warning');
    }
  };

  const chatHistory = chatHistories[workspaceId] || [];

  useEffect(() => {
    checkOllama();
    
    // Core System Feature Activation: Stability Engine Loop
    const interval = setInterval(() => {
      const messages = [
        'Routine heartbeat check: All subsystems nominal',
        'Memory buffer optimized for current workspace',
        'Stability Engine: verifying filesystem integrity...',
        'Predictive healing cycle started',
        'Autonomous monitoring: idle state stabilized'
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      addAgentLog(randomMsg, 'info');
    }, 45000); // Every 45 seconds add a routine log
    
    return () => clearInterval(interval);
  }, [checkOllama, addAgentLog]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setFileContextMenu(null);
      setShowExplorerSettings(false);
      setTabContextMenu(null);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ` for Terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setBottomPanelOpen(prev => !prev);
        setBottomPanelTab('terminal');
      }
      // Ctrl + N for New File
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewTextFile();
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        let newWidth = e.clientX - 48; // Activity bar width is 48
        if (newWidth < 150) newWidth = 150;
        if (newWidth > 600) newWidth = 600;
        setSidebarWidth(newWidth);
      } else if (isResizingChat) {
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 800) newWidth = 800;
        setChatWidth(newWidth);
      } else if (isResizingBottomPanel) {
        let newHeight = window.innerHeight - e.clientY - 24; // StatusBar height
        if (newHeight < 30) newHeight = 30; // Allow collapsing almost completely
        if (newHeight > window.innerHeight * 0.8) newHeight = window.innerHeight * 0.8;
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingChat(false);
      setIsResizingBottomPanel(false);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    
    if (isResizingSidebar || isResizingChat || isResizingBottomPanel) {
      document.body.style.cursor = isResizingBottomPanel ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, isResizingChat, isResizingBottomPanel]);

  const handleContextMenu = (e: React.MouseEvent, fileName: string) => {
    e.preventDefault();
    setFileContextMenu({ x: e.clientX, y: e.clientY, file: fileName });
  };
 
  const toggleSection = (section: keyof typeof explorerSections) => {
    setExplorerSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWindowAction = (action: string) => {
    // These only work if running in Electron
    if ((window as any).electronAPI) {
      if (action === 'close') (window as any).electronAPI.windowClose();
      if (action === 'minimize') (window as any).electronAPI.windowMinimize();
      if (action === 'maximize') (window as any).electronAPI.windowMaximize();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages((prev) => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && pastedImages.length === 0 && attachedFiles.length === 0) return;

    const userText = chatInput;
    pushChat({ 
      role: 'user', 
      text: userText,
      images: [...pastedImages],
      files: attachedFiles.map(f => f.name)
    });
    
    setChatInput('');
    setPastedImages([]);
    setAttachedFiles([]);
    
    // Simulate AI thinking and response based on Auto Mode
    setTimeout(() => {
      pushChat({ 
        role: 'assistant', 
        text: `I understand.` + (settings.autoApplyDiffs ? ` Auto mode is ON (${settings.aiModel}), so I am proceeding to make changes autonomously.` : ' I have created a plan. Would you like me to execute it?')
      });
    }, 1000);
  };

  const handleMenuAction = (label: string) => {
    switch (label) {
      case 'Explorer':
        setActiveTab('explorer');
        break;
      case 'Search':
        setActiveTab('search');
        break;
      case 'Source Control':
        setActiveTab('source');
        break;
      case 'Run':
        setActiveTab('run');
        break;
      case 'Extensions':
        setActiveTab('extensions');
        break;
      case 'Chat':
        setChatOpen(true);
        break;
      case 'Browser':
        setActiveTab('browser');
        break;
      case 'Preferences':
      case 'Settings':
        setActiveTab('settings');
        break;
      case 'Exit':
        handleWindowAction('close');
        break;
      case 'New Text File':
      case 'New File...':
        handleNewTextFile();
        break;
      case 'Open File...':
        handleOpenFile();
        break;
      case 'Run Build Task...':
        addNotification('Project Build Started...', 'info');
        setTimeout(() => addNotification('Build Completed Successfully', 'success'), 3000);
        break;
      case 'Save':
      case 'Save As...':
      case 'Save All':
        addNotification(`File ${currentFile} saved.`, 'success');
        break;
      case 'Close Editor':
        if (currentFile) closeFile(currentFile);
        break;
      case 'Undo':
      case 'Redo':
      case 'Cut':
      case 'Copy':
      case 'Paste':
        addNotification(`${label} operation successful`, 'success');
        break;
      case 'Terminal':
      case 'New Terminal':
        setBottomPanelOpen(true);
        setBottomPanelTab('terminal');
        break;
      case 'Command Palette...':
        addNotification("Command Palette opened", 'info');
        break;
      case 'Output':
        setBottomPanelOpen(true);
        setBottomPanelTab('output');
        break;
      case 'Problems':
        setBottomPanelOpen(true);
        setBottomPanelTab('problems');
        break;
      case 'Stability & Health':
        setBottomPanelOpen(true);
        setBottomPanelTab('stability');
        break;
      default:
        // Check if label is an existing filename to open it (for "Open Recent" etc)
        const file = files.find(f => f.name === label);
        if (file) {
          setFile(label);
          addNotification(`Opened ${label}`, 'info');
        } else {
          addNotification(`Action: ${label}`, 'info');
        }
        break;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-ide-bg text-ide-text font-sans flex-1 overflow-hidden">
      <WelcomeAnimation />
      <ToastManager />
      {/* Custom Titlebar for Electron */}
      <div className="h-8 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between pl-3 pr-2" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="flex items-center h-full text-xs text-gray-400">
          <Bot size={16} className="text-blue-500 mr-2" />
          <TopMenuBar onAction={handleMenuAction} />
        </div>
        
        <div className="absolute left-[50%] -translate-x-[50%] flex items-center h-full pointer-events-none text-gray-400 text-xs">
          al-Haramain iDe - {selectedFileObject.name}
        </div>

        <div className="flex items-center gap-4 text-gray-400" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={() => handleWindowAction('minimize')} className="hover:text-white flex items-center justify-center p-1"><Minus size={14} /></button>
          <button onClick={() => handleWindowAction('maximize')} className="hover:text-white flex items-center justify-center p-1"><Maximize2 size={12} /></button>
          <button onClick={() => handleWindowAction('close')} className="hover:text-white hover:bg-red-500 flex items-center justify-center p-1 px-2 -mr-2"><X size={14} /></button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-ide-activity flex flex-col items-center py-4 gap-4 border-r border-ide-border relative z-20">
          <button onClick={() => setActiveTab('explorer')} className={`p-2 rounded ${activeTab === 'explorer' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Explorer"><Files size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('search')} className={`p-2 rounded ${activeTab === 'search' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Search"><Search size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('source')} className={`p-2 rounded ${activeTab === 'source' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Source Control"><GitBranch size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('run')} className={`p-2 rounded ${activeTab === 'run' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Run and Debug"><Play size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('extensions')} className={`p-2 rounded ${activeTab === 'extensions' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Extensions"><Blocks size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('browser')} className={`p-2 rounded ${activeTab === 'browser' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Browser Subagent"><Globe size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('ollama')} className={`p-2 rounded ${activeTab === 'ollama' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Ollama Models"><Cpu size={24} strokeWidth={1.5} /></button>
          
          <div className="flex-1"></div>
          
          <button onClick={() => setChatOpen(!chatOpen)} className={`p-2 rounded ${chatOpen ? 'text-ide-accent' : 'text-gray-500 hover:text-white'}`} title="Agent Chat"><MessageSquare size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('health')} className={`p-2 rounded ${activeTab === 'health' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Stability & Health"><ShieldCheck size={24} strokeWidth={1.5} /></button>
          <button onClick={() => setActiveTab('settings')} className={`p-2 rounded ${activeTab === 'settings' ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Settings"><Settings size={24} strokeWidth={1.5} /></button>
        </div>

        {/* Primary Sidebar (Dynamic based on activeTab) */}
        {activeTab !== 'none' && (
          <div className="bg-ide-sidebar border-r border-ide-border flex flex-col relative z-10 flex-shrink-0" style={{ width: activeTab === 'ollama' || activeTab === 'browser' ? 384 : sidebarWidth }} onContextMenu={(e) => e.preventDefault()}>
            <div className="absolute top-0 -right-1 w-2 h-full cursor-ew-resize hover:bg-ide-accent/50 z-50 rounded" onMouseDown={(e) => { e.preventDefault(); setIsResizingSidebar(true); }} />
            {activeTab === 'explorer' ? (
              <div className="flex flex-col h-full w-full overflow-hidden select-none">
                <div className="px-4 py-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase flex justify-between items-center relative z-10">
                  <span>Explorer</span>
                  <div className="flex items-center gap-2">
                    <select 
                      value={workspaceId} 
                      onChange={(e) => setWorkspace(e.target.value)}
                      className="bg-[#3c3c3c] text-[10px] text-white py-0.5 px-1 rounded outline-none border border-ide-border appearance-none cursor-pointer"
                    >
                      <option value="default-project">default</option>
                      <option value="app-ui">app-ui</option>
                      <option value="backend-api">backend-api</option>
                    </select>
                    <div className="relative">
                      <button onClick={() => setShowExplorerSettings(!showExplorerSettings)} className="text-gray-400 hover:text-white flex items-center justify-center p-0.5 rounded hover:bg-[#3c3c3c]">
                        <MoreHorizontal size={14} />
                      </button>
                      {showExplorerSettings && (
                        <div className="absolute right-0 top-full mt-1 bg-[#252526] border border-ide-border rounded shadow-xl py-1 md:min-w-[160px] text-[13px] text-gray-200 z-50">
                          <button onClick={(e) => { e.stopPropagation(); toggleSection('openEditors'); setShowExplorerSettings(false); }} className="w-full text-left px-3 py-1.5 hover:bg-ide-accent hover:text-white flex items-center gap-2 transition-colors">
                            <span className="w-4 flex justify-center">{explorerSections.openEditors && <Check size={14} />}</span> Open Editors
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleSection('workspace'); setShowExplorerSettings(false); }} className="w-full text-left px-3 py-1.5 hover:bg-ide-accent hover:text-white flex items-center gap-2 transition-colors">
                            <span className="w-4 flex justify-center">{explorerSections.workspace && <Check size={14} />}</span> Folders
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleSection('outline'); setShowExplorerSettings(false); }} className="w-full text-left px-3 py-1.5 hover:bg-ide-accent hover:text-white flex items-center gap-2 transition-colors">
                            <span className="w-4 flex justify-center">{explorerSections.outline && <Check size={14} />}</span> Outline
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleSection('artifacts'); setShowExplorerSettings(false); }} className="w-full text-left px-3 py-1.5 hover:bg-ide-accent hover:text-white flex items-center gap-2 transition-colors">
                            <span className="w-4 flex justify-center">{explorerSections.artifacts && <Check size={14} />}</span> Timeline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 overflow-y-auto">
                  {/* SEARCH INPUT */}
                  <div className="px-3 py-2">
                    <div className="relative">
                      <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Filter files..." 
                        className="w-full bg-[#3c3c3c] border border-ide-border rounded pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-ide-accent"
                        value={explorerSearchQuery}
                        onChange={(e) => setExplorerSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* OPEN EDITORS */}
                  <div>
                    <div 
                      className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-gray-300 font-semibold text-xs transition-colors"
                      onClick={() => toggleSection('openEditors')}
                    >
                      {explorerSections.openEditors ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                      <span className="uppercase text-[10px] font-bold tracking-tight text-gray-500 ml-1 flex-1">Open Editors</span>
                      {explorerSections.openEditors && openFiles.length > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); useIDEStore.getState().openFiles.forEach(f => useIDEStore.getState().closeFile(f)); }}
                          className="mr-2 text-gray-500 hover:text-white p-0.5 rounded hover:bg-[#3c3c3c] transition-colors"
                          title="Close All Editors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    {explorerSections.openEditors && (
                      <div className="flex flex-col pb-2">
                        {openFiles.map((fileName) => (
                          <div
                            key={fileName}
                            className={`flex items-center px-6 py-1 text-sm group cursor-pointer ${currentFile === fileName ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white'}`}
                            onClick={() => setFile(fileName)}
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); closeFile(fileName); }}
                              className="mr-2 opacity-0 group-hover:opacity-100 hover:bg-[#454545] rounded p-0.5"
                            >
                              <X size={12} />
                            </button>
                            <Files size={12} className="mr-2 opacity-70" />
                            <span className="truncate">{fileName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PROJECT FOLDERS */}
                  <div>
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-gray-300 font-semibold text-xs transition-colors group">
                      <div className="flex items-center flex-1" onClick={() => toggleSection('workspace')}>
                        {explorerSections.workspace ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                        <span className="uppercase text-[10px] font-bold tracking-tight text-gray-500 ml-1">Workspace</span>
                      </div>
                      {/* Explorer Toolbar */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleNewFile(); }} className="p-0.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white" title="New File"><FilePlus size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); addNotification('New Folder Prompt Opened', 'info'); }} className="p-0.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white" title="New Folder"><FolderPlus size={14}/></button>
                        <button onClick={(e) => { e.stopPropagation(); addNotification('Workspace Refreshed', 'success'); }} className="p-0.5 hover:bg-[#3c3c3c] rounded text-gray-400 hover:text-white" title="Refresh"><RefreshCw size={14}/></button>
                      </div>
                    </div>
                    {explorerSections.workspace && (
                      <div className="flex flex-col pb-2">
                        {files
                          .filter(f => f.name.toLowerCase().includes(explorerSearchQuery.toLowerCase()))
                          .map((file) => (
                          <button
                            key={file.name}
                            onClick={() => setFile(file.name)}
                            onContextMenu={(e) => handleContextMenu(e, file.name)}
                            className={`flex items-center px-6 py-1 text-sm text-left ${selectedFileObject.name === file.name ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white'}`}
                          >
                            <Files size={14} className="mr-2 opacity-70" />
                            {file.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OUTLINE */}
                  <div>
                    <div 
                      className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-gray-300 font-semibold text-xs transition-colors"
                      onClick={() => toggleSection('outline')}
                    >
                      {explorerSections.outline ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                      <span className="uppercase text-[10px] font-bold tracking-tight text-gray-500 ml-1">Outline</span>
                    </div>
                    {explorerSections.outline && (
                      <div className="flex flex-col pb-2 px-9 text-xs text-gray-500">
                        <div className="flex items-center py-1"><ListTree size={12} className="mr-2 text-blue-400"/> initializeApp()</div>
                        <div className="flex items-center py-1"><Code2 size={12} className="mr-2 text-purple-400"/> renderView()</div>
                        <div className="flex items-center py-1"><Database size={12} className="mr-2 text-yellow-400"/> stateConfig</div>
                      </div>
                    )}
                  </div>

                  {/* AGENT TIMELINE (Autonomous logs) */}
                  <div>
                    <div 
                      className="flex items-center px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer text-gray-300 font-semibold text-xs transition-colors"
                      onClick={() => toggleSection('artifacts')}
                    >
                      {explorerSections.artifacts ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                      <span className="uppercase text-[10px] font-bold tracking-tight text-gray-500 ml-1">Agent Stability Log</span>
                    </div>
                    {explorerSections.artifacts && (
                      <div className="flex flex-col pb-2 max-h-64 overflow-y-auto scrollbar-hide">
                        {agentLogs.length === 0 ? (
                          <div className="px-6 py-2 text-[10px] text-gray-500 italic">No logs yet.</div>
                        ) : (
                          agentLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`flex flex-col px-6 py-1.5 border-l-2 mb-1 ${
                                log.type === 'success' ? 'border-green-500 bg-green-500/5' :
                                log.type === 'error' ? 'border-red-500 bg-red-500/5' :
                                log.type === 'warning' ? 'border-yellow-500 bg-yellow-500/5' :
                                'border-blue-500 bg-blue-500/5'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-bold uppercase ${
                                  log.type === 'success' ? 'text-green-400' :
                                  log.type === 'error' ? 'text-red-400' :
                                  log.type === 'warning' ? 'text-yellow-400' :
                                  'text-blue-400'
                                }`}>
                                  {log.type}
                                </span>
                                <span className="text-[9px] text-gray-500">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-300 leading-tight mt-0.5">{log.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'search' ? (
              <SearchView />
            ) : activeTab === 'extensions' ? (
              <ExtensionsView />
            ) : activeTab === 'health' ? (
              <StabilityView />
            ) : activeTab === 'settings' ? (
              <SettingsView />
            ) : activeTab === 'source' ? (
              <SourceView />
            ) : activeTab === 'browser' ? (
              <BrowserView />
            ) : activeTab === 'run' ? (
              <RunView />
            ) : (
                <div className="flex flex-col h-full w-full items-center justify-center p-8 text-center bg-[#252526]">
                  <div className="w-16 h-16 bg-ide-accent/10 rounded-full flex items-center justify-center text-ide-accent mb-4">
                    {activeTab === 'run' ? <Play size={32} /> : 
                     activeTab === 'browser' ? <Globe size={32} /> : 
                     activeTab === 'ai' ? <Bot size={32} /> :
                     <Cpu size={32} />}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">
                    {activeTab.toUpperCase()} Module
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed max-w-[200px]">
                    Autonomous activation for the <strong>{activeTab}</strong> subsystem is in progress.
                  </p>
                  <div className="mt-4 flex flex-col gap-1.5 w-full">
                     <div className="h-1 w-full bg-[#333] rounded-full overflow-hidden">
                        <div className="h-full bg-ide-accent" style={{ width: '85%' }}></div>
                     </div>
                     <span className="text-[9px] text-ide-accent font-bold font-mono uppercase tracking-tighter">Core System Activated</span>
                  </div>
                </div>
            )}
          </div>
        )}

        {/* Floating Context Menu for Files */}
        {fileContextMenu && (
          <div 
            className="fixed bg-[#252526] border border-ide-border rounded shadow-xl py-1 z-50 text-xs text-gray-300 min-w-[200px]"
            style={{ top: fileContextMenu.y, left: fileContextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 font-semibold text-white border-b border-ide-border mb-1 truncate">{fileContextMenu.file}</div>
            
            <button onClick={() => { setFileContextMenu(null); handleNewTextFile(); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between">New Text File</button>
            <button onClick={() => { setFileContextMenu(null); handleNewFile(); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between">New File...</button>
            <button onClick={() => { setFileContextMenu(null); addNotification('New Folder Prompt Opened', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between">New Folder...</button>
            <div className="h-px bg-ide-border my-1"></div>
            <button onClick={() => { setFileContextMenu(null); addNotification('File Copied to Clipboard', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between">Copy <span className="text-gray-500">Ctrl+C</span></button>
            <button onClick={() => { setFileContextMenu(null); addNotification('File Cut to Clipboard', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between">Cut <span className="text-gray-500">Ctrl+X</span></button>
            <button className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between text-gray-500 cursor-not-allowed">Paste <span className="text-gray-600">Ctrl+V</span></button>
            <div className="h-px bg-ide-border my-1"></div>
            <button onClick={() => { setFileContextMenu(null); handleRenameFile(fileContextMenu.file); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Rename...</button>
            <button onClick={() => { setFileContextMenu(null); handleDeleteFile(fileContextMenu.file); }} className="w-full text-left px-4 py-1.5 hover:bg-red-500 hover:text-white">Delete</button>
            <div className="h-px bg-ide-border my-1"></div>
            <button onClick={() => { setFileContextMenu(null); addNotification('Revealed in OS Explorer', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Reveal in OS Explorer</button>
            
            <div className="h-px bg-ide-border my-1"></div>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-ide-accent font-semibold flex items-center gap-1"><ShieldCheck size={10}/> Agent Policy</div>
            <button onClick={() => { setFileContextMenu(null); addNotification('Agent Access Granted', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-[#3c3c3c] hover:text-green-400 flex items-center gap-2"><CheckCircle2 size={12}/> Allow Agent Access</button>
            <button onClick={() => { setFileContextMenu(null); addNotification('Agent Access Restricted', 'error'); }} className="w-full text-left px-4 py-1.5 hover:bg-[#3c3c3c] hover:text-red-400 flex items-center gap-2"><AlertCircle size={12}/> Restrict Agent</button>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-ide-bg">
          <div 
            className="flex h-10 bg-[#1e1e1e] border-b border-ide-border relative overflow-x-auto scrollbar-hide no-scrollbar"
            onContextMenu={(e) => {
              e.preventDefault();
              setTabContextMenu({ x: e.clientX, y: e.clientY });
            }}
          >
            {openFiles.map((fileName) => (
              <div 
                key={fileName}
                onClick={() => setFile(fileName)}
                className={`flex items-center px-4 border-r border-ide-border text-sm cursor-pointer whitespace-nowrap transition-colors relative h-full group ${
                  currentFile === fileName 
                    ? 'bg-ide-bg text-ide-accent border-b border-b-ide-accent' 
                    : 'bg-[#2d2d2d] text-gray-500 hover:bg-[#2a2d22e] hover:text-gray-300'
                }`}
              >
                <Files size={14} className={`mr-2 ${currentFile === fileName ? 'text-ide-accent' : 'text-gray-500'}`} />
                {fileName}
                <button 
                  onClick={(e) => { e.stopPropagation(); closeFile(fileName); }}
                  className={`ml-3 p-0.5 rounded-sm hover:bg-[#454545] transition-opacity ${currentFile === fileName ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Tab Context Menu */}
            {tabContextMenu && (
              <div 
                className="fixed bg-[#252526] border border-[#454545] rounded-md shadow-2xl py-1 z-50 text-[13px] text-gray-200 min-w-[240px]"
                style={{ top: tabContextMenu.y, left: tabContextMenu.x }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => { setTabContextMenu(null); handleNewTextFile(); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between group"><span>New Text File</span><span className="text-gray-400 group-hover:text-white">Ctrl+N</span></button>
                <button onClick={() => { setTabContextMenu(null); handleOpenFile(); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between group"><span>Open File...</span><span className="text-gray-400 group-hover:text-white">Ctrl+P</span></button>
                <div className="h-px bg-[#3c3c3c] my-1"></div>
                <button onClick={() => { setTabContextMenu(null); setBottomPanelOpen(true); setBottomPanelTab('terminal'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">New Terminal</button>
                <div className="h-px bg-[#3c3c3c] my-1"></div>
                <button onClick={() => { setTabContextMenu(null); addNotification('Split Up', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between group"><span>Split Up</span><span className="text-gray-400 group-hover:text-white">Ctrl+K Ctrl+\</span></button>
                <button onClick={() => { setTabContextMenu(null); addNotification('Split Down', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Split Down</button>
                <button onClick={() => { setTabContextMenu(null); addNotification('Split Left', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Split Left</button>
                <button onClick={() => { setTabContextMenu(null); addNotification('Split Right', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Split Right</button>
                <div className="h-px bg-[#3c3c3c] my-1"></div>
                <button onClick={() => { setTabContextMenu(null); addNotification('Moved to New Window', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Move into New Window</button>
                <button onClick={() => { setTabContextMenu(null); addNotification('Copied to New Window', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Copy into New Window</button>
                <div className="h-px bg-[#3c3c3c] my-1"></div>
                <button onClick={() => { setTabContextMenu(null); addNotification('Tab Bar Menu Opened', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between items-center group"><span>Tab Bar</span><ChevronRight size={14} className="text-gray-400 group-hover:text-white" /></button>
                <button onClick={() => { setTabContextMenu(null); addNotification('Editor Actions Position Menu', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between items-center group"><span>Editor Actions Position</span><ChevronRight size={14} className="text-gray-400 group-hover:text-white" /></button>
                <div className="h-px bg-[#3c3c3c] my-1"></div>
                <button onClick={() => { setTabContextMenu(null); addNotification('Tabs Configured', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white">Configure Tabs</button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={selectedFileObject.name.endsWith('.py') ? 'python' : selectedFileObject.name.endsWith('.tsx') ? 'typescript' : 'css'}
              theme="vs-dark"
              value={selectedFileObject.content}
              onChange={(v) => {
                  updateFile(selectedFileObject.name, v || '');
                  if (useIDEStore.getState().gitInSync) {
                      useIDEStore.setState({ gitInSync: false });
                  }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 }
              }}
            />
          </div>
          {/* Bottom Panel */}
          {bottomPanelOpen && (
          <div className="border-t border-ide-border bg-[#1e1e1e] flex flex-col relative flex-shrink-0" style={{ height: bottomPanelHeight }}>
            <div className="flex h-8 items-center px-4 gap-4 text-xs tracking-wider text-gray-400 border-b border-ide-border">
              <button 
                className={`uppercase hover:text-white ${bottomPanelTab === 'problems' ? 'text-white border-b border-ide-accent h-full -mb-[1px]' : ''}`}
                onClick={() => setBottomPanelTab('problems')}
              >
                Problems
              </button>
              <button 
                className={`uppercase hover:text-white ${bottomPanelTab === 'output' ? 'text-white border-b border-ide-accent h-full -mb-[1px]' : ''}`}
                onClick={() => setBottomPanelTab('output')}
              >
                Output
              </button>
              <button 
                className={`uppercase hover:text-white flex items-center gap-1 ${bottomPanelTab === 'terminal' ? 'text-white border-b border-ide-accent h-full -mb-[1px]' : ''}`}
                onClick={() => setBottomPanelTab('terminal')}
              >
                Terminal
              </button>
              <button 
                className={`uppercase hover:text-white flex items-center gap-1 ${bottomPanelTab === 'stability' ? 'text-white border-b border-ide-accent h-full -mb-[1px]' : ''}`}
                onClick={() => setBottomPanelTab('stability')}
              >
                Stability & Health
              </button>
              <div className="flex-1"></div>
              {bottomPanelTab === 'terminal' && (
                <select 
                  value={terminalType} 
                  onChange={(e) => setTerminalType(e.target.value)}
                  className="bg-transparent text-xs text-gray-400 hover:text-white outline-none cursor-pointer mr-2"
                >
                  <option value="powershell">PowerShell</option>
                  <option value="cmd">Command Prompt</option>
                  <option value="bash">Bash</option>
                </select>
              )}
              <button onClick={() => setBottomPanelOpen(false)} className="hover:text-white p-1 ml-2"><X size={14} /></button>
            </div>
            
            <div className="p-2 font-mono text-xs text-gray-300 flex-1 overflow-y-auto">
              {bottomPanelTab === 'terminal' && (
                <div className="flex flex-col gap-1">
                  {terminalType === 'powershell' && <div><span className="text-green-400">PS C:\Users\user\local-ai-ide</span>&gt; {isDevServerRunning ? 'npm run dev' : ''}</div>}
                  {terminalType === 'cmd' && <div><span className="text-green-400">C:\Users\user\local-ai-ide</span>&gt; {isDevServerRunning ? 'npm run dev' : ''}</div>}
                  {terminalType === 'bash' && <div><span className="text-green-400">user@desktop</span>:<span className="text-blue-400">~/local-ai-ide</span>$ {isDevServerRunning ? 'npm run dev' : ''}</div>}
                  
                  {isDevServerRunning && (
                    <div className="mt-2 text-gray-400 space-y-0.5">
                      <div className="text-blue-400 font-bold">VITE v5.2.11  ready in 142 ms</div>
                      <div>➜  Local:   <span className="text-ide-accent">http://localhost:3000/</span></div>
                      <div>➜  Network: use --host to expose</div>
                      <div className="text-gray-500 mt-2">12:52:43 PM [vite] hot updated: /src/App.tsx</div>
                    </div>
                  )}
                </div>
              )}
              {bottomPanelTab === 'output' && (
                <div className="text-gray-400">
                  [IDE] Extension host started successfully.<br/>
                  [IDE] Found 0 locally installed extensions.
                </div>
              )}
              {bottomPanelTab === 'problems' && (
                <div className="text-gray-400 flex flex-col items-center justify-center h-full opacity-60">
                  <CheckCircle2 size={32} className="mb-2" />
                  <span>No problems have been detected in the workspace.</span>
                </div>
              )}
              {bottomPanelTab === 'stability' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#252526] p-3 rounded border border-ide-border">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Process Stability</div>
                      <div className={`text-lg font-bold ${isDevServerRunning ? 'text-green-400' : 'text-gray-400'}`}>{isDevServerRunning ? '99.9%' : 'OFFLINE'}</div>
                      <div className="text-[10px] text-gray-600">{isDevServerRunning ? 'All subsystems nominal' : 'Dev server not active'}</div>
                    </div>
                    <div className="bg-[#252526] p-3 rounded border border-ide-border">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Memory Usage</div>
                      <div className={`text-lg font-bold ${isDevServerRunning ? 'text-blue-400' : 'text-gray-400'}`}>{isDevServerRunning ? '242 MB' : '0 MB'}</div>
                      <div className="text-[10px] text-gray-600">{isDevServerRunning ? 'Healthy range for IDE host' : 'Processes suspended'}</div>
                    </div>
                    <div className="bg-[#252526] p-3 rounded border border-ide-border">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">AI Engine Latency</div>
                      <div className="text-lg font-bold text-yellow-400">14ms</div>
                      <div className="text-[10px] text-gray-600">Local inference optimized</div>
                    </div>
                  </div>
                  <div className="bg-[#252526] p-3 rounded border border-ide-border">
                    <div className="text-xs font-semibold mb-2">Autonomous Agent History</div>
                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                      {agentLogs.map(log => (
                        <div key={log.id} className="flex items-center gap-2 text-[10px] py-1 border-b border-ide-border last:border-0">
                          <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>{log.type.toUpperCase()}</span>
                          <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute -top-1.5 left-0 right-0 h-3 cursor-ns-resize hover:bg-ide-accent/50 transition-colors z-[100] rounded" 
                 onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizingBottomPanel(true); }}></div>
          </div>
          )}
        </div>

        {/* AI Chat Sidebar */}
        {chatOpen && (
          <div className="bg-ide-sidebar border-l border-ide-border flex flex-col shadow-xl z-20 relative flex-shrink-0" style={{ width: chatWidth }}>
            <div className="absolute top-0 -left-1 w-2 h-full cursor-ew-resize hover:bg-ide-accent/50 z-50 rounded" onMouseDown={(e) => { e.preventDefault(); setIsResizingChat(true); }} />
            <div className="p-2 border-b border-ide-border flex justify-between items-center bg-[#252526]">
              <div className="flex items-center gap-2 text-gray-300 ml-2">
                <span className="font-semibold text-[13px] tracking-wider uppercase">Chat</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Plus Menu Button */}
                <div className="relative">
                  <button onClick={() => {setShowNewMenu(!showNewMenu); setShowMoreMenu(false);}} className="text-gray-400 hover:bg-[#3c3c3c] p-1 rounded transition-colors flex items-center"><Plus size={16} /><ChevronDown size={12} className="ml-0.5 opacity-60" /></button>
                  {showNewMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-[#252526] border border-ide-border rounded-md shadow-lg py-1 z-50 text-[13px] text-gray-200">
                      <button onClick={(e) => { e.stopPropagation(); setShowNewMenu(false); addNotification('Started New Chat', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between"><span className="font-medium">New Chat</span><span className="text-gray-400 text-[11px]">Ctrl+N</span></button>
                      <div className="h-px bg-[#3c3c3c] my-1"></div>
                      <button onClick={(e) => { e.stopPropagation(); setShowNewMenu(false); addNotification('Opened New Chat Editor', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white flex justify-between"><span className="font-medium">New Chat Editor</span><span className="text-gray-400 text-[11px]">Ctrl+N</span></button>
                      <button onClick={(e) => { e.stopPropagation(); setShowNewMenu(false); addNotification('Opened New Chat Window', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white font-medium">New Chat Window</button>
                      <div className="h-px bg-[#3c3c3c] my-1"></div>
                      <button onClick={(e) => { e.stopPropagation(); setShowNewMenu(false); addNotification('Started New Codex Agent', 'success'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white font-medium">New Codex Agent</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowNewMenu(false); addNotification('Started New Copilot CLI Session', 'info'); }} className="w-full text-left px-4 py-1.5 hover:bg-ide-accent hover:text-white font-medium">New Copilot CLI Session</button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <button onClick={() => setActiveTab('settings')} className="text-gray-400 hover:bg-[#3c3c3c] p-1 rounded transition-colors" title="Chat Settings"><Settings size={14} strokeWidth={2} /></button>

                {/* More Settings Button */}
                <div className="relative">
                  <button onClick={() => {setShowMoreMenu(!showMoreMenu); setShowNewMenu(false);}} className="text-gray-400 hover:bg-[#3c3c3c] p-1 rounded transition-colors"><MoreHorizontal size={16} /></button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-[#252526] border border-ide-border rounded-md shadow-lg py-1 z-50 text-[13px] text-gray-200">
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Undo Last Edit', 'info'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Undo Last Edit</button>
                      <button className="w-full text-left px-6 py-1.5 text-gray-500 cursor-not-allowed">Redo Last Edit</button>
                      
                      <div className="h-px bg-[#3c3c3c] my-1.5"></div>
                      
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Moved Chat into Editor Area', 'info'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Move Chat into Editor Area</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Moved Chat into New Window', 'info'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Move Chat into New Window</button>
                      
                      <div className="h-px bg-[#3c3c3c] my-1.5"></div>
                      
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Opened Tool Sets', 'success'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Tool Sets</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); setActiveTab('settings'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Chat Settings</button>
                      
                      <div className="h-px bg-[#3c3c3c] my-1.5"></div>
                      
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Chat Debug View Enabled', 'warning'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Show Chat Debug View</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('Agent Debug Logs Opened', 'info'); }} className="w-full text-left px-6 py-1.5 hover:bg-ide-accent hover:text-white transition-colors">Show Agent Debug Logs</button>
                      <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); addNotification('View Default settings saved', 'success'); }} className="w-full text-left px-2 py-1.5 hover:bg-ide-accent hover:text-white flex items-center transition-colors">
                        <CheckCircle2 size={14} className="mr-2" />
                        <span>Show View by Default</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:bg-[#3c3c3c] p-1 rounded ml-1 transition-colors"><X size={16} /></button>
              </div>
            </div>
            
            {/* Agent Mode Toggle */}
            <div className="px-3 py-2 bg-[#1e1e1e] border-b border-ide-border flex justify-between items-center z-10">
              <div className="flex bg-[#252526] rounded border border-ide-border p-0.5 w-full">
                <button 
                  onClick={() => setAgentMode('fast')}
                  className={`flex-1 flex justify-center items-center gap-1 py-1 px-2 rounded text-xs transition-colors ${agentMode === 'fast' ? 'bg-[#3c3c3c] text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Zap size={12} /> Fast Mode
                </button>
                <button 
                  onClick={() => setAgentMode('planning')}
                  className={`flex-1 flex justify-center items-center gap-1 py-1 px-2 rounded text-xs transition-colors ${agentMode === 'planning' ? 'bg-[#3c3c3c] text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <ListTodo size={12} /> Planning Mode
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" onClick={() => {setShowMoreMenu(false); setShowNewMenu(false);}}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' ? 'bg-ide-accent text-white' : 'bg-[#3c3c3c] text-gray-200'
                  }`}>
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((img, i) => (
                          <img key={i} src={img} alt="Pasted" className="max-w-xs max-h-32 rounded border border-white/20" />
                        ))}
                      </div>
                    )}
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.files.map((f, i) => (
                          <div key={i} className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs">
                            <Paperclip size={12} /> {f}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-ide-border bg-[#252526]" onClick={() => {setShowMoreMenu(false); setShowNewMenu(false);}}>
              {(pastedImages.length > 0 || attachedFiles.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pastedImages.map((img, i) => (
                    <div key={i} className="relative inline-block">
                      <img src={img} alt="Pasted" className="h-12 w-auto rounded border border-ide-border" />
                      <button type="button" onClick={() => setPastedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-ide-bg rounded-full p-0.5 border border-ide-border text-white hover:bg-red-500"><X size={10} /></button>
                    </div>
                  ))}
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="relative inline-flex items-center bg-[#3c3c3c] rounded px-2 py-1 text-xs border border-ide-border gap-1 text-gray-300">
                      <Paperclip size={10} />
                      <span className="truncate max-w-[100px]">{f.name}</span>
                      <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-gray-400 hover:text-red-400"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleChatSubmit} className="relative border border-ide-border rounded bg-[#3c3c3c] focus-within:border-ide-accent">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Ask to build or fix something... (Paste images)"
                  className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none resize-none h-16 min-h-[64px]"
                  style={{ paddingBottom: '32px' }}
                />
                <div className="absolute bottom-1 left-2 flex items-center gap-1">
                  <label className="text-gray-400 hover:text-white cursor-pointer p-1 rounded hover:bg-[#4c4c4c] transition-colors" title="Attach file">
                    <Paperclip size={16} />
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                  <label className="text-gray-400 hover:text-white cursor-pointer p-1 rounded hover:bg-[#4c4c4c] transition-colors" title="Attach image">
                    <ImageIcon size={16} />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <button 
                  type="submit"
                  className="absolute bottom-2 right-2 text-gray-400 hover:text-white hover:bg-[#4c4c4c] p-1 rounded transition-colors"
                  disabled={!chatInput.trim() && pastedImages.length === 0 && attachedFiles.length === 0}
                >
                  <Send size={16} className={chatInput.trim() || pastedImages.length > 0 || attachedFiles.length > 0 ? 'text-ide-accent' : ''} />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Model: {settings.aiModel}</span>
                <span className="flex items-center gap-1"><TerminalSquare size={12}/> Executing locally</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-ide-accent text-white flex items-center justify-between px-3 text-[11px] font-medium z-50">
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
            <GitBranch size={13} />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
            <RefreshCw size={13} className={isDevServerRunning ? 'animate-spin' : ''} />
            <span>{isDevServerRunning ? 'Vite Dev Running' : 'Server Idle'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
            <Bot size={13} />
            <span>Autonomous Engine: Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ln 42, Col 18</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full transition-colors cursor-pointer font-bold">
              <CheckCircle2 size={13} />
              <span>Prettier</span>
            </div>
            <div className="hover:bg-white/10 px-2 h-full transition-colors cursor-pointer">
               <Bell size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
