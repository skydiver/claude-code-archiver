/**
 * Application run mode
 */
export type RunMode = 'normal' | 'dry-run' | 'dev';

let currentMode: RunMode = 'normal';

/**
 * Set the application run mode (called from index.tsx)
 */
export function setRunMode(mode: RunMode): void {
  currentMode = mode;
}

/**
 * Get the current run mode
 */
export function getRunMode(): RunMode {
  return currentMode;
}

/**
 * Check if operations should be skipped (dry-run or dev mode)
 */
export function isReadOnly(): boolean {
  return currentMode !== 'normal';
}

/**
 * Get display info for the current mode
 */
export function getModeInfo(): { message: string; color: 'yellow' | 'cyan' } | null {
  switch (currentMode) {
    case 'dry-run':
      return {
        message: 'Read-only mode — no files will be moved',
        color: 'cyan',
      };
    case 'dev':
      return {
        message: 'DEV MODE — Destructive operations disabled',
        color: 'yellow',
      };
    default:
      return null;
  }
}
