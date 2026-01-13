import { render } from 'ink';
import { App } from './App';
import { setRunMode } from './lib/config';

// Parse CLI arguments
const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  setRunMode('dry-run');
} else if (args.includes('--dev')) {
  setRunMode('dev');
}

// ANSI escape codes for alternate screen buffer
const ENTER_ALT_SCREEN = '\x1b[?1049h';
const EXIT_ALT_SCREEN = '\x1b[?1049l';
const CLEAR_SCREEN = '\x1b[2J\x1b[H';

// Enter alternate screen and clear
process.stdout.write(ENTER_ALT_SCREEN + CLEAR_SCREEN);

// Restore terminal on exit
function cleanup() {
  process.stdout.write(EXIT_ALT_SCREEN);
}

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

render(<App />);
