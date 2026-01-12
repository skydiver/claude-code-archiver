import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import archiver from 'archiver';
import type { ArchiveResult, Session } from '@/types';

export type { ArchiveResult };

const DEV_MODE = process.env['NODE_ENV'] !== 'production';
const ARCHIVE_FOLDER = '.archived';

/**
 * Archive a single session: create zip, then delete original
 */
export async function archiveSession(session: Session): Promise<ArchiveResult> {
  const archiveDir = join(session.projectPath, ARCHIVE_FOLDER);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const zipName = `${session.id}_${timestamp}.zip`;
  const archivePath = join(archiveDir, zipName);

  // Dev mode: skip actual archiving
  if (DEV_MODE) {
    console.log(`[DEV] Would archive: ${session.id}`);
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

    // Create zip archive
    await createZip(session.path, archivePath);

    // Delete original file
    await unlink(session.path);

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
 * Create a zip file containing the session file
 */
function createZip(sourcePath: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(destPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.file(sourcePath, { name: basename(sourcePath) });
    archive.finalize();
  });
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
