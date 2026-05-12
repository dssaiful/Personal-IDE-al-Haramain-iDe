import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';

const menus: Record<string, any[]> = {
  File: [
    { label: 'New Text File', shortcut: 'Ctrl+N' },
    { label: 'New File...', shortcut: 'Ctrl+Alt+Windows+N' },
    { label: 'New Window', shortcut: 'Ctrl+Shift+N' },
    { label: 'New Window with Profile', items: [
      { label: 'Default' },
      { label: 'Cloud Development' },
      { label: 'Data Science' }
    ]},
    { type: 'separator' },
    { label: 'Open File...', shortcut: 'Ctrl+O' },
    { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O' },
    { label: 'Open Workspace from File...' },
    { label: 'Open Recent', items: [
      { label: 'main.py' },
      { label: 'App.tsx' },
      { label: 'index.css' },
      { type: 'separator' },
      { label: 'Clear Recently Opened' }
    ]},
    { type: 'separator' },
    { label: 'Add Folder to Workspace...' },
    { label: 'Save Workspace As...' },
    { label: 'Duplicate Workspace' },
    { type: 'separator' },
    { label: 'Save', shortcut: 'Ctrl+S' },
    { label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
    { label: 'Save All', shortcut: 'Ctrl+K S', disabled: true },
    { type: 'separator' },
    { label: 'Share', items: [
      { label: 'Live Share' },
      { label: 'Export as ZIP' },
      { label: 'Share to Cloud' }
    ]},
    { type: 'separator' },
    { label: 'Auto Save' },
    { label: 'Preferences', items: [
      { label: 'Settings' },
      { label: 'Keyboard Shortcuts' },
      { label: 'User Snippets' },
      { label: 'Color Theme' },
      { label: 'File Icon Theme' }
    ]},
    { type: 'separator' },
    { label: 'Revert File' },
    { label: 'Close Editor', shortcut: 'Ctrl+F4' },
    { label: 'Close Folder', shortcut: 'Ctrl+K F' },
    { label: 'Close Window', shortcut: 'Alt+F4' },
    { type: 'separator' },
    { label: 'Exit' }
  ],
  Edit: [
    { label: 'Undo', shortcut: 'Ctrl+Z' },
    { label: 'Redo', shortcut: 'Ctrl+Y' },
    { type: 'separator' },
    { label: 'Cut', shortcut: 'Ctrl+X' },
    { label: 'Copy', shortcut: 'Ctrl+C' },
    { label: 'Paste', shortcut: 'Ctrl+V' },
    { type: 'separator' },
    { label: 'Find', shortcut: 'Ctrl+F' },
    { label: 'Replace', shortcut: 'Ctrl+H' },
    { type: 'separator' },
    { label: 'Find in Files', shortcut: 'Ctrl+Shift+F' },
    { label: 'Replace in Files', shortcut: 'Ctrl+Shift+H' },
    { type: 'separator' },
    { label: 'Toggle Line Comment', shortcut: 'Ctrl+/' },
    { label: 'Toggle Block Comment', shortcut: 'Shift+Alt+A' },
    { label: 'Emmet: Expand Abbreviation', shortcut: 'Tab' }
  ],
  Selection: [
    { label: 'Select All', shortcut: 'Ctrl+A' },
    { label: 'Expand Selection', shortcut: 'Shift+Alt+RightArrow' },
    { label: 'Shrink Selection', shortcut: 'Shift+Alt+LeftArrow' },
    { type: 'separator' },
    { label: 'Copy Line Up', shortcut: 'Shift+Alt+UpArrow' },
    { label: 'Copy Line Down', shortcut: 'Shift+Alt+DownArrow' },
    { label: 'Move Line Up', shortcut: 'Alt+UpArrow' },
    { label: 'Move Line Down', shortcut: 'Alt+DownArrow' },
    { label: 'Duplicate Selection' },
    { type: 'separator' },
    { label: 'Add Cursor Above', shortcut: 'Ctrl+Alt+UpArrow' },
    { label: 'Add Cursor Below', shortcut: 'Ctrl+Alt+DownArrow' },
    { label: 'Add Cursors to Line Ends', shortcut: 'Shift+Alt+I' },
    { label: 'Add Next Occurrence', shortcut: 'Ctrl+D' },
    { label: 'Add Previous Occurrence' },
    { label: 'Select All Occurrences' },
    { type: 'separator' },
    { label: 'Switch to Ctrl+Click for Multi-Cursor' },
    { label: 'Column Selection Mode' }
  ],
  View: [
    { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P' },
    { label: 'Open View...' },
    { type: 'separator' },
    { label: 'Appearance', items: [
      { label: 'Full Screen' },
      { label: 'Zen Mode' },
      { label: 'Centered Layout' },
      { type: 'separator' },
      { label: 'Menu Bar' },
      { label: 'Side Bar' },
      { label: 'Status Bar' },
      { label: 'Activity Bar' }
    ]},
    { label: 'Editor Layout', items: [
      { label: 'Single' },
      { label: 'Two Columns' },
      { label: 'Three Columns' },
      { label: 'Two Rows' },
      { label: 'Grid' }
    ]},
    { type: 'separator' },
    { label: 'Explorer', shortcut: 'Ctrl+Shift+E' },
    { label: 'Search', shortcut: 'Ctrl+Shift+F' },
    { label: 'Source Control', shortcut: 'Ctrl+Shift+G' },
    { label: 'Run', shortcut: 'Ctrl+Shift+D' },
    { label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
    { label: 'Testing' },
    { type: 'separator' },
    { label: 'Chat', shortcut: 'Ctrl+Alt+I' },
    { label: 'Browser', shortcut: 'Ctrl+Alt+/' },
    { type: 'separator' },
    { label: 'Problems', shortcut: 'Ctrl+Shift+M' },
    { label: 'Output', shortcut: 'Ctrl+Shift+U' },
    { label: 'Debug Console', shortcut: 'Ctrl+Shift+Y' },
    { label: 'Terminal', shortcut: 'Ctrl+`' }
  ],
  Go: [
    { label: 'Back', shortcut: 'Alt+LeftArrow' },
    { label: 'Forward', shortcut: 'Alt+RightArrow' },
    { label: 'Last Edit Location', shortcut: 'Ctrl+K Ctrl+Q' },
    { type: 'separator' },
    { label: 'Switch Editor', hasSub: true },
    { label: 'Switch Group', hasSub: true },
    { type: 'separator' },
    { label: 'Go to File...', shortcut: 'Ctrl+P' },
    { label: 'Go to Symbol in Workspace...', shortcut: 'Ctrl+T' },
    { type: 'separator' },
    { label: 'Go to Symbol in Editor...', shortcut: 'Ctrl+Shift+O' },
    { label: 'Go to Definition', shortcut: 'F12' },
    { label: 'Go to Declaration' },
    { label: 'Go to Type Definition' },
    { label: 'Go to Implementations', shortcut: 'Ctrl+F12' },
    { label: 'Go to References', shortcut: 'Shift+F12' },
    { type: 'separator' },
    { label: 'Go to Line/Column...', shortcut: 'Ctrl+G' },
    { label: 'Go to Bracket', shortcut: 'Ctrl+Shift+\\' },
    { type: 'separator' },
    { label: 'Next Problem', shortcut: 'F8' },
    { label: 'Previous Problem', shortcut: 'Shift+F8' },
    { type: 'separator' },
    { label: 'Next Change', shortcut: 'Alt+F3' },
    { label: 'Previous Change', shortcut: 'Shift+Alt+F3' }
  ],
  Run: [
    { label: 'Start Debugging', shortcut: 'F5' },
    { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
    { label: 'Stop Debugging', shortcut: 'Shift+F5' },
    { label: 'Restart Debugging', shortcut: 'Ctrl+Shift+F5' },
    { type: 'separator' },
    { label: 'Open Configurations', disabled: true },
    { label: 'Add Configuration...' },
    { type: 'separator' },
    { label: 'Step Over', shortcut: 'F10' },
    { label: 'Step Into', shortcut: 'F11' },
    { label: 'Step Out', shortcut: 'Shift+F11' },
    { label: 'Continue', shortcut: 'F5' },
    { type: 'separator' },
    { label: 'Toggle Breakpoint', shortcut: 'F9' },
    { label: 'New Breakpoint', hasSub: true },
    { type: 'separator' },
    { label: 'Enable All Breakpoints' },
    { label: 'Disable All Breakpoints' },
    { label: 'Remove All Breakpoints' },
    { type: 'separator' },
    { label: 'Install Additional Debuggers...' }
  ],
  Terminal: [
    { label: 'New Terminal', shortcut: 'Ctrl+Shift+`' },
    { label: 'Split Terminal', shortcut: 'Ctrl+Shift+5' },
    { label: 'New Terminal Window', shortcut: 'Ctrl+Shift+Alt+`' },
    { type: 'separator' },
    { label: 'Run Task...' },
    { label: 'Run Build Task...', shortcut: 'Ctrl+Shift+B' },
    { label: 'Run Active File' },
    { label: 'Run Selected Text' },
    { type: 'separator' },
    { label: 'Show Running Tasks...', disabled: true },
    { label: 'Restart Running Task...', disabled: true },
    { label: 'Terminate Task...', disabled: true },
    { type: 'separator' },
    { label: 'Configure Tasks...' },
    { label: 'Configure Default Build Task...' }
  ],
  Help: [
    { label: 'Welcome' },
    { label: 'Show All Commands', shortcut: 'Ctrl+Shift+P' },
    { label: 'Documentation' },
    { label: 'Editor Playground' },
    { label: 'Open Walkthrough...' },
    { label: 'Show Release Notes' },
    { label: 'Get Started with Accessibility Features' },
    { label: 'Ask @vscode' },
    { type: 'separator' },
    { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+K Ctrl+R' },
    { label: 'Video Tutorials' },
    { label: 'Tips and Tricks' },
    { type: 'separator' },
    { label: 'Join Us on YouTube' },
    { label: 'Search Feature Requests' },
    { label: 'Report Issue' },
    { type: 'separator' },
    { label: 'View License' },
    { label: 'Privacy Statement' },
    { type: 'separator' },
    { label: 'Toggle Developer Tools' },
    { label: 'Open Process Explorer' },
    { type: 'separator' },
    { label: 'Restart to Update' }
  ]
};

export function TopMenuBar({ onAction }: { onAction: (label: string) => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addNotification = useIDEStore((state) => state.addNotification);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setActiveSubMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setActiveSubMenu(null);
  };

  const handleMenuHover = (menuName: string) => {
    if (activeMenu) {
      setActiveMenu(menuName);
      setActiveSubMenu(null);
    }
  };

  const handleAction = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(null);
    setActiveSubMenu(null);
    onAction(label);
  };

  return (
    <div className="flex h-full items-center text-[13px] text-gray-300 relative z-50 ml-4 font-sans" ref={containerRef} style={{ WebkitAppRegion: 'no-drag' } as any}>
      {Object.entries(menus).map(([menuName, items]) => (
        <div key={menuName} className="relative h-full flex items-center">
          <div
            className={`px-2 py-1 rounded cursor-default ${
              activeMenu === menuName ? 'bg-[#3c3c3c] text-white' : 'hover:bg-[#3c3c3c] hover:text-white'
            }`}
            onClick={(e) => handleMenuClick(menuName, e)}
            onMouseEnter={() => handleMenuHover(menuName)}
          >
            {menuName}
          </div>
          {activeMenu === menuName && (
            <div className="absolute top-full left-0 mt-[1px] bg-[#1a1a23] border border-ide-border rounded-md shadow-2xl py-1 min-w-[280px]">
              {items.map((item, idx) => {
                if (item.type === 'separator') {
                  return <div key={idx} className="h-px bg-[#3c3c3c] my-1" />;
                }
                const hasSub = !!item.items;
                return (
                  <div key={idx} className="relative group/item" onMouseEnter={() => setActiveSubMenu(hasSub ? item.label : null)}>
                    <button
                      className={`w-full text-left px-4 py-1 flex items-center justify-between ${
                        item.disabled
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'hover:bg-ide-accent hover:text-white'
                      } ${activeSubMenu === item.label ? 'bg-ide-accent text-white' : ''}`}
                      disabled={item.disabled}
                      onClick={(e) => !hasSub && handleAction(item.label || '', e)}
                    >
                      <span>{item.label}</span>
                      <div className="flex items-center gap-2">
                        {item.shortcut && <span className="text-gray-500 text-xs group-hover/item:text-white/70">{item.shortcut}</span>}
                        {hasSub && <ChevronRight size={14} className="text-gray-400 group-hover/item:text-white" />}
                      </div>
                    </button>
                    
                    {hasSub && activeSubMenu === item.label && (
                      <div className="absolute left-full top-0 ml-[1px] bg-[#1a1a23] border border-ide-border rounded-md shadow-2xl py-1 min-w-[200px]">
                        {item.items.map((subItem: any, sIdx: number) => {
                          if (subItem.type === 'separator') return <div key={sIdx} className="h-px bg-[#3c3c3c] my-1" />;
                          return (
                            <button
                              key={sIdx}
                              className="w-full text-left px-4 py-1 hover:bg-ide-accent hover:text-white text-gray-300"
                              onClick={(e) => handleAction(subItem.label || '', e)}
                            >
                              {subItem.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
