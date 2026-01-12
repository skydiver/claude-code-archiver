import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Project } from '@/types';

const CLAUDE_PROJECTS_DIR = join(homedir(), '.claude', 'projects');

/**
 * Get all Claude Code projects from ~/.claude/projects
 */
export async function getProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    const entries = await readdir(CLAUDE_PROJECTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      // Claude project folders start with "-"
      if (!entry.isDirectory() || !entry.name.startsWith('-')) {
        continue;
      }

      const projectPath = join(CLAUDE_PROJECTS_DIR, entry.name);
      const sessionCount = await countSessions(projectPath);

      // Skip empty projects
      if (sessionCount === 0) {
        continue;
      }

      const readablePath = await getReadablePath(projectPath, entry.name);

      projects.push({
        folderName: entry.name,
        path: projectPath,
        readablePath,
        sessionCount,
      });
    }
  } catch {
    // Directory doesn't exist or can't be read
    return [];
  }

  // Sort by readable path
  return projects.sort((a, b) => a.readablePath.localeCompare(b.readablePath));
}

/**
 * Count .jsonl session files in a project folder
 */
async function countSessions(projectPath: string): Promise<number> {
  try {
    const entries = await readdir(projectPath);
    return entries.filter((name) => name.endsWith('.jsonl')).length;
  } catch {
    return 0;
  }
}

/**
 * Get human-readable path from session files or decode folder name
 */
async function getReadablePath(
  projectPath: string,
  folderName: string
): Promise<string> {
  // Try to extract cwd from the first session file
  try {
    const entries = await readdir(projectPath);
    const firstJsonl = entries.find((name) => name.endsWith('.jsonl'));

    if (firstJsonl) {
      const filePath = join(projectPath, firstJsonl);
      const content = await readFile(filePath, 'utf-8');
      const firstLine = content.split('\n')[0];

      if (firstLine) {
        const parsed = JSON.parse(firstLine) as Record<string, unknown>;
        if (typeof parsed['cwd'] === 'string') {
          return shortenPath(parsed['cwd']);
        }
      }
    }
  } catch {
    // Fall through to decode folder name
  }

  // Decode folder name: -Users-martin-foo -> /Users/martin/foo
  return decodeFolderName(folderName);
}

/**
 * Decode Claude's folder name encoding back to a path
 * -Users-martin--config -> /Users/martin/.config
 */
function decodeFolderName(folderName: string): string {
  return folderName
    .replace(/^-/, '/') // Leading dash -> /
    .replace(/--/g, '/.') // Double dash -> /.
    .replace(/-/g, '/'); // Single dash -> /
}

/**
 * Shorten path by replacing home directory with ~
 */
function shortenPath(path: string): string {
  const home = homedir();
  if (path.startsWith(home)) {
    return '~' + path.slice(home.length);
  }
  return path;
}

/**
 * Check if Claude projects directory exists
 */
export async function projectsDirExists(): Promise<boolean> {
  try {
    const stats = await stat(CLAUDE_PROJECTS_DIR);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get the Claude projects directory path
 */
export function getProjectsDir(): string {
  return CLAUDE_PROJECTS_DIR;
}
