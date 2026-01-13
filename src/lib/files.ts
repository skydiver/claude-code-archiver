import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { Session } from '@/types';

export interface ArchiveFile {
  name: string;
  path: string;
  size: number;
  type: 'jsonl' | 'folder' | 'agent' | 'agent-folder';
}

export interface ArchiveFileSet {
  sessionId: string;
  files: ArchiveFile[];
  totalSize: number;
}

/**
 * Get all files that will be archived for a list of sessions
 */
export async function getFilesToArchive(
  sessions: Session[]
): Promise<ArchiveFileSet[]> {
  const results: ArchiveFileSet[] = [];

  for (const session of sessions) {
    const files = await getSessionFiles(session);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    results.push({
      sessionId: session.id,
      files,
      totalSize,
    });
  }

  return results;
}

/**
 * Get all files for a single session
 */
async function getSessionFiles(session: Session): Promise<ArchiveFile[]> {
  const files: ArchiveFile[] = [];
  const fileName = basename(session.path);

  // 1. Main .jsonl file
  files.push({
    name: fileName,
    path: session.path,
    size: session.size,
    type: 'jsonl',
  });

  // 2. Companion folder (if exists)
  const folderName = fileName.replace(/\.jsonl$/, '');
  const folderPath = join(session.projectPath, folderName);
  const folderSize = await getFolderSize(folderPath);
  if (folderSize > 0) {
    files.push({
      name: folderName + '/',
      path: folderPath,
      size: folderSize,
      type: 'folder',
    });
  }

  // 3. Related agent files
  const agentFiles = await getRelatedAgentFiles(session.id, session.projectPath);
  files.push(...agentFiles);

  return files;
}

/**
 * Get agent files related to a session
 */
async function getRelatedAgentFiles(
  sessionId: string,
  projectPath: string
): Promise<ArchiveFile[]> {
  const files: ArchiveFile[] = [];

  try {
    const entries = await readdir(projectPath);
    const agentEntries = entries.filter(
      (e) => e.startsWith('agent-') && e.endsWith('.jsonl')
    );

    for (const agentFile of agentEntries) {
      const agentPath = join(projectPath, agentFile);
      const belongsToSession = await checkAgentBelongsToSession(agentPath, sessionId);

      if (belongsToSession) {
        const agentStats = await stat(agentPath);
        files.push({
          name: agentFile,
          path: agentPath,
          size: agentStats.size,
          type: 'agent',
        });

        // Check for agent companion folder
        const agentFolderName = agentFile.replace(/\.jsonl$/, '');
        const agentFolderPath = join(projectPath, agentFolderName);
        const agentFolderSize = await getFolderSize(agentFolderPath);
        if (agentFolderSize > 0) {
          files.push({
            name: agentFolderName + '/',
            path: agentFolderPath,
            size: agentFolderSize,
            type: 'agent-folder',
          });
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return files;
}

/**
 * Check if an agent file belongs to a session
 */
async function checkAgentBelongsToSession(
  agentPath: string,
  sessionId: string
): Promise<boolean> {
  try {
    const content = await readFile(agentPath, 'utf-8');
    const firstLine = content.split('\n')[0];
    if (!firstLine) return false;

    const parsed = JSON.parse(firstLine) as Record<string, unknown>;
    return parsed['sessionId'] === sessionId;
  } catch {
    return false;
  }
}

/**
 * Get total size of a folder (0 if doesn't exist)
 */
async function getFolderSize(folderPath: string): Promise<number> {
  try {
    const entries = await readdir(folderPath);
    let total = 0;

    for (const entry of entries) {
      const entryPath = join(folderPath, entry);
      const stats = await stat(entryPath);
      if (stats.isFile()) {
        total += stats.size;
      } else if (stats.isDirectory()) {
        total += await getFolderSize(entryPath);
      }
    }

    return total;
  } catch {
    return 0;
  }
}
