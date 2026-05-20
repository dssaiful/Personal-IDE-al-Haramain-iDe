import type { IDEFile } from '../../stores/ideStore';

export interface WorkspaceContext {
  currentFile: string | null;
  currentFileContent: string;
  openTabs: string[];
  selectedCode: string;
  folderStructure: string;
  packageJson: string;
  gitChanges: string;
  recentTerminalOutput: string;
}

const MAX_CONTEXT_CHARS = 8000;

export function collectContext(
  files: IDEFile[],
  currentFile: string | null,
  openFiles: string[],
  selectedCode?: string,
  terminalOutput?: string,
  gitDiff?: string
): WorkspaceContext {
  const currentFileObj = files.find(f => f.name === currentFile);
  const pkgJson = files.find(f => f.name === 'package.json');

  const folderLines = files.map(f => f.name).sort();

  return {
    currentFile,
    currentFileContent: truncate(currentFileObj?.content || '', 3000),
    openTabs: openFiles,
    selectedCode: truncate(selectedCode || '', 2000),
    folderStructure: truncate(folderLines.join('\n'), 1000),
    packageJson: truncate(pkgJson?.content || '', 500),
    gitChanges: truncate(gitDiff || '', 500),
    recentTerminalOutput: truncate(terminalOutput || '', 500),
  };
}

export function buildContextPrompt(ctx: WorkspaceContext): string {
  const sections: string[] = [];

  if (ctx.currentFile) {
    sections.push(`## Current File: ${ctx.currentFile}\n\`\`\`\n${ctx.currentFileContent}\n\`\`\``);
  }

  if (ctx.selectedCode) {
    sections.push(`## Selected Code\n\`\`\`\n${ctx.selectedCode}\n\`\`\``);
  }

  if (ctx.openTabs.length > 0) {
    sections.push(`## Open Tabs\n${ctx.openTabs.join(', ')}`);
  }

  if (ctx.folderStructure) {
    sections.push(`## Project Files\n${ctx.folderStructure}`);
  }

  if (ctx.packageJson) {
    sections.push(`## package.json\n\`\`\`json\n${ctx.packageJson}\n\`\`\``);
  }

  if (ctx.gitChanges) {
    sections.push(`## Git Changes\n\`\`\`diff\n${ctx.gitChanges}\n\`\`\``);
  }

  if (ctx.recentTerminalOutput) {
    sections.push(`## Recent Terminal Output\n\`\`\`\n${ctx.recentTerminalOutput}\n\`\`\``);
  }

  const combined = sections.join('\n\n');
  return truncate(combined, MAX_CONTEXT_CHARS);
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '\n... (truncated)';
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
