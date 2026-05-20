import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { io, Socket } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
  socketUrl?: string;
  onOutput?: (output: string) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ socketUrl = 'http://localhost:3000', onOutput }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const outputBufferRef = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#aeafad',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\x1b[32m[SYSTEM] Desktop Core Terminal Connected.\x1b[0m');
    });

    socket.on('data', (data: string) => {
      term.write(data);
      // Capture last 2000 chars of output for AI context
      outputBufferRef.current += data;
      if (outputBufferRef.current.length > 2000) {
        outputBufferRef.current = outputBufferRef.current.slice(-2000);
      }
      onOutput?.(outputBufferRef.current);
    });

    term.onData((data) => {
      socket.emit('input', data);
    });

    const handleResize = () => {
      fitAddon.fit();
      socket.emit('resize', { cols: term.cols, rows: term.rows });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      term.dispose();
    };
  }, [socketUrl, onOutput]);

  return (
    <div className="w-full h-full bg-[#1e1e1e] overflow-hidden" ref={terminalRef} />
  );
};
