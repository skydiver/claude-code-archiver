/**
 * Represents a Claude Code project folder
 */
export interface Project {
  /** Encoded folder name (e.g., "-Users-martin-Development-Labs-foo") */
  folderName: string;
  /** Full path to the project folder */
  path: string;
  /** Human-readable path extracted from session files */
  readablePath: string;
  /** Number of session files in this project */
  sessionCount: number;
}

/**
 * Represents a Claude Code session (conversation)
 */
export interface Session {
  /** Session UUID (filename without .jsonl) */
  id: string;
  /** Full path to the .jsonl file */
  path: string;
  /** Project this session belongs to */
  projectPath: string;
  /** File size in bytes */
  size: number;
  /** First summary found in the session (for display) */
  summary: string | undefined;
  /** Whether this session has a custom title */
  hasCustomTitle: boolean;
  /** Custom title if set */
  customTitle: string | undefined;
  /** Timestamp of the session (from first entry) */
  timestamp: Date | undefined;
  /** Number of related agent files */
  agentCount: number;
}

/**
 * Archive type criteria
 */
export type ArchiveType = 'unnamed' | 'older-than' | 'by-size';

/**
 * Archive type option for selection
 */
export interface ArchiveTypeOption {
  id: ArchiveType;
  label: string;
  description: string;
  available: boolean;
}

/**
 * Error types for better user feedback
 */
export type ArchiveErrorType =
  | 'permission'    // EACCES - No permission to read/write
  | 'not-found'     // ENOENT - File/directory doesn't exist
  | 'already-exists'// EEXIST - File already in .archived/
  | 'disk-full'     // ENOSPC - No space left on device
  | 'unknown';      // Other errors

/**
 * Result of archiving a single session
 */
export interface ArchiveResult {
  session: Session;
  success: boolean;
  archivePath: string | undefined;
  error: string | undefined;
  errorType: ArchiveErrorType | undefined;
}

/**
 * App screens for navigation
 */
export type Screen =
  | 'project-select'
  | 'archive-type'
  | 'session-preview'
  | 'progress'
  | 'summary';

/**
 * Global app state
 */
export interface AppState {
  screen: Screen;
  selectedProjects: Project[];
  archiveType: ArchiveType;
  sessionsToArchive: Session[];
  archiveResults: ArchiveResult[];
  dryRun: boolean;
}

/**
 * Keybinding definition for footer
 */
export interface Keybinding {
  key: string;
  label: string;
}
