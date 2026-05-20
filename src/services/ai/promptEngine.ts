import { buildContextPrompt, type WorkspaceContext } from './contextCollector';

export type AIAction =
  | 'explain'
  | 'fix_bug'
  | 'optimize'
  | 'refactor'
  | 'document'
  | 'generate_tests'
  | 'convert_language'
  | 'find_error'
  | 'ask_ai'
  | 'generate_file'
  | 'commit_message'
  | 'pr_description'
  | 'explain_diff'
  | 'explain_terminal_error'
  | 'suggest_fix_terminal'
  | 'inline_complete';

const SYSTEM_PROMPT = `You are a highly skilled AI coding assistant integrated into a local IDE called MyNiceIDE V2. You are running locally via Ollama.

Your capabilities:
- Write clean, production-ready code
- Explain code clearly and concisely
- Fix bugs and suggest optimizations
- Generate tests and documentation
- Create new files and components
- Understand project context from open files and folder structure

Rules:
- Be concise but thorough
- Use markdown code blocks with language tags
- When generating file content, wrap it in code blocks
- When suggesting file changes, show the full updated code
- Never ask for API keys or cloud services - everything is local
- Reference file names and line numbers when relevant`;

const ACTION_PROMPTS: Record<AIAction, string> = {
  explain: 'Explain the following code clearly and concisely. Describe what it does, how it works, and any important patterns used.',
  fix_bug: 'Analyze the following code for bugs. Identify issues and provide the corrected code with explanations.',
  optimize: 'Optimize the following code for better performance, readability, and maintainability. Show the improved version.',
  refactor: 'Refactor the following code to improve its structure, maintainability, and adherence to best practices. Show the refactored version.',
  document: 'Generate comprehensive documentation comments for the following code. Include JSDoc/docstring style comments.',
  generate_tests: 'Generate comprehensive unit tests for the following code. Use appropriate testing frameworks.',
  convert_language: 'Convert the following code to a different language as requested. Maintain the same logic and structure.',
  find_error: 'Analyze the following code and identify any potential errors, security issues, or anti-patterns.',
  ask_ai: 'Answer the following question about coding, using the workspace context provided.',
  generate_file: 'Generate the requested file or component. Provide the complete file content ready to save.',
  commit_message: 'Generate a concise, conventional commit message for the following changes. Use the format: type(scope): description',
  pr_description: 'Generate a pull request description for the following changes. Include a summary, changes list, and testing notes.',
  explain_diff: 'Explain the following git diff in simple terms. Describe what changed and why it might matter.',
  explain_terminal_error: 'Explain the following terminal error. Describe what went wrong and how to fix it.',
  suggest_fix_terminal: 'Suggest a command to fix the following terminal error.',
  inline_complete: 'Complete the following code. Only provide the completion, no explanation. Continue from exactly where the code ends.',
};

export function buildPrompt(
  action: AIAction,
  userInput: string,
  context?: WorkspaceContext,
  additionalInstructions?: string
): { system: string; prompt: string } {
  const actionPrompt = ACTION_PROMPTS[action];
  let prompt = `${actionPrompt}\n\n`;

  if (context) {
    const contextStr = buildContextPrompt(context);
    if (contextStr) {
      prompt += `# Workspace Context\n${contextStr}\n\n`;
    }
  }

  prompt += `# User Request\n${userInput}`;

  if (additionalInstructions) {
    prompt += `\n\n# Additional Instructions\n${additionalInstructions}`;
  }

  return { system: SYSTEM_PROMPT, prompt };
}

export function buildChatMessages(
  chatHistory: Array<{ role: string; text: string }>,
  context?: WorkspaceContext
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (context) {
    const contextStr = buildContextPrompt(context);
    if (contextStr) {
      messages.push({
        role: 'system',
        content: `Current workspace context:\n${contextStr}`,
      });
    }
  }

  for (const msg of chatHistory) {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text,
    });
  }

  return messages;
}

export function buildInlineCompletionPrompt(
  codeBefore: string,
  codeAfter: string,
  language: string,
  fileName: string
): { system: string; prompt: string } {
  const system = `You are an inline code completion engine. Output ONLY the code completion, no explanations, no markdown, no code blocks. Continue from exactly where the cursor is.`;
  const prompt = `File: ${fileName} (${language})
Code before cursor:
${codeBefore.slice(-500)}
Code after cursor:
${codeAfter.slice(0, 200)}

Complete the code at the cursor position:`;

  return { system, prompt };
}
