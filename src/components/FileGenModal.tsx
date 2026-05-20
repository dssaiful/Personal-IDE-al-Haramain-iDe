import React from 'react';
import type { FileGenerationRequest } from '../stores/ideStore';
import { FileCode, Check, X } from 'lucide-react';

interface FileGenModalProps {
  request: FileGenerationRequest;
  onApprove: () => void;
  onReject: () => void;
}

export const FileGenModal: React.FC<FileGenModalProps> = ({ request, onApprove, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={onReject}>
      <div
        className="bg-[#252526] border border-ide-border rounded-lg shadow-2xl w-[600px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ide-border">
          <div className="flex items-center gap-2 text-ide-accent">
            <FileCode size={18} />
            <span className="text-sm font-bold">AI File Generation</span>
          </div>
          <button onClick={onReject} className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#3c3c3c]">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-ide-border">
          <div className="text-xs text-gray-400 mb-1">File to create:</div>
          <div className="text-sm text-white font-mono bg-[#1e1e1e] px-3 py-1.5 rounded border border-ide-border">
            {request.fileName}
          </div>
          <div className="text-xs text-gray-500 mt-2">Prompt: {request.prompt}</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="text-xs text-gray-400 mb-2">Preview:</div>
          <pre className="text-xs text-gray-300 bg-[#1e1e1e] p-3 rounded border border-ide-border overflow-x-auto whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
            {request.content}
          </pre>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-ide-border">
          <button
            onClick={onApprove}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Check size={14} /> Approve & Create
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
          >
            <X size={14} /> Reject
          </button>
        </div>
      </div>
    </div>
  );
};
