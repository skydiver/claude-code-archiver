import { mkdir, rename } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { ArchiveResult, Session } from '@/types';

export type { ArchiveResult };

const DEV_MODE = process.env['NODE_ENV'] !== 'production';
const ARCHIVE_FOLDER = '.archived';

/**
 * Archive a single session: move to .archived folder
 */
export async function archiveSession(session: Session): Promise<ArchiveResult> {
  const archiveDir = join(session.projectPath, ARCHIVE_FOLDER);
  const fileName = basename(session.path);
  const archivePath = join(archiveDir, fileName);

  // Dev mode: skip actual archiving
  if (DEV_MODE) {
    return {
      session,
      success: true,
      archivePath: `[DEV] ${archivePath}`,
      error: undefined,
    };
  }

  try {
    // Ensure archive directory exists
    await mkdir(archiveDir, { recursive: true });

    // Move file to archive folder
    await rename(session.path, archivePath);

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

/**
 * Check if we're in dev mode (destructive operations disabled)
 */
export function isDevMode(): boolean {
  return DEV_MODE;
}
