import { getOllamaBaseUrl } from './modelManager';

export interface StreamOptions {
  model: string;
  prompt: string;
  system?: string;
  context?: number[];
  temperature?: number;
  signal?: AbortSignal;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string, context?: number[]) => void;
  onError: (error: string) => void;
}

export async function streamGenerate(
  options: StreamOptions,
  callbacks: StreamCallbacks
): Promise<void> {
  const { model, prompt, system, context, temperature, signal } = options;
  const base = getOllamaBaseUrl();
  let fullText = '';

  try {
    const body: Record<string, unknown> = {
      model,
      prompt,
      stream: true,
    };
    if (system) body.system = system;
    if (context) body.context = context;
    if (temperature !== undefined) body.options = { temperature };

    const res = await fetch(`${base}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      callbacks.onError(`Ollama error: ${res.status} ${res.statusText}`);
      return;
    }
    if (!res.body) {
      callbacks.onError('No response body from Ollama');
      return;
    }

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
          if (json.response) {
            fullText += json.response;
            callbacks.onToken(json.response);
          }
          if (json.done) {
            callbacks.onDone(fullText, json.context);
            return;
          }
        } catch { /* skip malformed */ }
      }
    }

    callbacks.onDone(fullText);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone(fullText);
      return;
    }
    callbacks.onError(err instanceof Error ? err.message : 'Stream failed');
  }
}

export async function streamChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const base = getOllamaBaseUrl();
  let fullText = '';

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    });

    if (!res.ok) {
      callbacks.onError(`Ollama error: ${res.status} ${res.statusText}`);
      return;
    }
    if (!res.body) {
      callbacks.onError('No response body from Ollama');
      return;
    }

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
          if (json.message?.content) {
            fullText += json.message.content;
            callbacks.onToken(json.message.content);
          }
          if (json.done) {
            callbacks.onDone(fullText);
            return;
          }
        } catch { /* skip */ }
      }
    }

    callbacks.onDone(fullText);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone(fullText);
      return;
    }
    callbacks.onError(err instanceof Error ? err.message : 'Stream failed');
  }
}
