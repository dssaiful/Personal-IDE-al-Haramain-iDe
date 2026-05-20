const OLLAMA_BASE = 'http://127.0.0.1:11434';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelManagerState {
  models: OllamaModel[];
  activeModel: string;
  status: 'checking' | 'connected' | 'disconnected';
}

export async function detectOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchModels(): Promise<OllamaModel[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: Record<string, unknown>) => ({
      name: m.name as string,
      size: m.size as number,
      digest: (m.digest as string) || '',
      modified_at: (m.modified_at as string) || '',
      details: m.details || undefined,
    }));
  } catch {
    return [];
  }
}

export async function pullModel(
  modelName: string,
  onProgress?: (status: string, completed?: number, total?: number) => void
): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
    });
    if (!res.ok || !res.body) return false;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          onProgress?.(json.status, json.completed, json.total);
        } catch { /* skip malformed lines */ }
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteModel(modelName: string): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function formatModelSize(bytes: number): string {
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getOllamaBaseUrl(): string {
  return OLLAMA_BASE;
}
