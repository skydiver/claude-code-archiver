import { readdir, readFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import type { ArchiveType, Project, Session } from '@/types';

/**
 * Get all sessions from a project
 */
export async function getSessions(project: Project): Promise<Session[]> {
  const sessions: Session[] = [];

  try {
    const entries = await readdir(project.path);

    for (const entry of entries) {
      if (!entry.endsWith('.jsonl')) {
        continue;
      }

      const sessionPath = join(project.path, entry);
      const session = await parseSession(sessionPath, project.path);

      if (session) {
        sessions.push(session);
      }
    }
  } catch {
    return [];
  }

  // Sort by timestamp (newest first)
  return sessions.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

/**
 * Get sessions from multiple projects
 */
export async function getSessionsFromProjects(
  projects: Project[]
): Promise<Session[]> {
  const allSessions: Session[] = [];

  for (const project of projects) {
    const sessions = await getSessions(project);
    allSessions.push(...sessions);
  }

  return allSessions;
}

/**
 * Parse a session file and extract metadata
 */
async function parseSession(
  sessionPath: string,
  projectPath: string
): Promise<Session | undefined> {
  try {
    const content = await readFile(sessionPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    const stats = await stat(sessionPath);

    let summary: string | undefined;
    let customTitle: string | undefined;
    let hasCustomTitle = false;
    let timestamp: Date | undefined;

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as Record<string, unknown>;

        // Check for custom title
        if (parsed['type'] === 'custom-title') {
          hasCustomTitle = true;
          customTitle =
            typeof parsed['customTitle'] === 'string'
              ? parsed['customTitle']
              : undefined;
        }

        // Get first summary
        if (!summary && parsed['type'] === 'summary') {
          summary =
            typeof parsed['summary'] === 'string'
              ? parsed['summary']
              : undefined;
        }

        // Get timestamp from first entry with one
        if (!timestamp && typeof parsed['timestamp'] === 'string') {
          timestamp = new Date(parsed['timestamp']);
        }
      } catch {
        // Skip invalid JSON lines
        continue;
      }
    }

    return {
      id: basename(sessionPath, '.jsonl'),
      path: sessionPath,
      projectPath,
      size: stats.size,
      summary,
      hasCustomTitle,
      customTitle,
      timestamp,
    };
  } catch {
    return undefined;
  }
}

/**
 * Filter sessions by archive type
 */
export function filterSessions(
  sessions: Session[],
  archiveType: ArchiveType
): Session[] {
  switch (archiveType) {
    case 'unnamed':
      return sessions.filter((s) => !s.hasCustomTitle);

    case 'older-than':
      // TODO: Implement age-based filtering
      return [];

    case 'by-size':
      // TODO: Implement size-based filtering
      return [];

    default:
      return [];
  }
}

/**
 * Calculate total size of sessions in bytes
 */
export function getTotalSize(sessions: Session[]): number {
  return sessions.reduce((total, session) => total + session.size, 0);
}

/**
 * Format bytes to human-readable string
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Truncate UUID for display (first 8 chars)
 */
export function truncateId(id: string): string {
  return id.slice(0, 8) + '...';
}
