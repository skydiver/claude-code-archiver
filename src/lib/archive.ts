import { mkdir, rename, stat, readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { ArchiveResult, Session } from '@/types';
import { isReadOnly, getRunMode } from './config';

export type { ArchiveResult };

const ARCHIVE_FOLDER = '.archived';

/**
 * Archive a single session: move .jsonl file, companion folder, and related agent files
 */
export async function archiveSession(session: Session): Promise<ArchiveResult> {
  const archiveDir = join(session.projectPath, ARCHIVE_FOLDER);
  const fileName = basename(session.path);
  const archivePath = join(archiveDir, fileName);

  // Companion folder has same name without .jsonl extension
  const folderName = fileName.replace(/\.jsonl$/, '');
  const folderPath = join(session.projectPath, folderName);
  const archiveFolderPath = join(archiveDir, folderName);

  // Read-only modes: skip actual archiving
  if (isReadOnly()) {
    const prefix = getRunMode() === 'dev' ? '[DEV]' : '[DRY-RUN]';
    return {
      session,
      success: true,
      archivePath: `${prefix} ${archivePath}`,
      error: undefined,
    };
  }

  try {
    // Ensure archive directory exists
    await mkdir(archiveDir, { recursive: true });

    // Move the .jsonl file
    await rename(session.path, archivePath);

    // Move companion folder if it exists
    if (await exists(folderPath)) {
      await rename(folderPath, archiveFolderPath);
    }

    // Move related agent files
    await moveRelatedAgentFiles(session.id, session.projectPath, archiveDir);

    return {
      session,
      success: true,
      archivePath,
      error: undefined,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return {
      session,
      success: false,
      archivePath: undefined,
      error,
    };
  }
}

/**
 * Find and move agent files that belong to a session
 */
async function moveRelatedAgentFiles(
  sessionId: string,
  projectPath: string,
  archiveDir: string
): Promise<void> {
  try {
    const entries = await readdir(projectPath);
    const agentFiles = entries.filter(
      (e) => e.startsWith('agent-') && e.endsWith('.jsonl')
    );

    for (const agentFile of agentFiles) {
      const agentPath = join(projectPath, agentFile);
      const belongsToSession = await checkAgentBelongsToSession(
        agentPath,
        sessionId
      );

      if (belongsToSession) {
        // Move agent .jsonl file
        await rename(agentPath, join(archiveDir, agentFile));

        // Move agent companion folder if exists
        const agentFolderName = agentFile.replace(/\.jsonl$/, '');
        const agentFolderPath = join(projectPath, agentFolderName);
        if (await exists(agentFolderPath)) {
          await rename(agentFolderPath, join(archiveDir, agentFolderName));
        }
      }
    }
  } catch {
    // Ignore errors when moving agent files - main session is already archived
  }
}

/**
 * Check if an agent file belongs to a specific session
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
 * Check if a path exists
 */
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Archive multiple sessions with progress callback
 */
export async function archiveSessions(
  sessions: Session[],
  onProgress?: (completed: number, total: number, current: Session) => void
): Promise<ArchiveResult[]> {
  const results: ArchiveResult[] = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (!session) continue;

    onProgress?.(i, sessions.length, session);

    const result = await archiveSession(session);
    results.push(result);
  }

  return results;
}

/**
 * Get summary of archive results
 */
export function getArchiveSummary(results: ArchiveResult[]): {
  total: number;
  successful: number;
  failed: number;
  totalSize: number;
} {
  const successful = results.filter((r) => r.success).length;
  const totalSize = results
    .filter((r) => r.success)
    .reduce((sum, r) => sum + r.session.size, 0);

  return {
    total: results.length,
    successful,
    failed: results.length - successful,
    totalSize,
  };
}

// Re-export config utilities for components
export { isReadOnly, getRunMode, getModeInfo } from './config';
