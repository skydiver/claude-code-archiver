# Claude Code Archiver

A terminal app to clean up old Claude Code conversations and free up disk space.

---

## The Problem

[Claude Code](https://claude.ai/code) stores every conversation in `~/.claude/projects/` as `.jsonl` files. Over time, these pile up and can take gigabytes of space — especially if you use Claude Code daily.

**But not all conversations are worth keeping.** Quick questions, abandoned experiments, and one-off debugging sessions clutter your history.

## The Solution

Claude Code Archiver helps you:

- **Find** conversations by criteria (unnamed, by title pattern, etc.)
- **Preview** exactly what will be archived with expandable file details
- **Archive** sessions by moving them to a `.archived/` folder
- **Restore easily** — just move files back if needed

Named conversations are **never touched** unless you explicitly search for them by title.

---

## Usage

Run directly without installing:

```bash
npx github:skydiver/claude-code-archiver
```

Preview mode (no files moved):

```bash
npx github:skydiver/claude-code-archiver --dry-run
```

---

## How It Works

1. **Select a project** — Choose which Claude Code project to scan
2. **Pick archive criteria** — Unnamed sessions or search by title
3. **Review sessions** — Expandable preview shows all files to be moved
4. **Confirm** — Double-press Enter to archive
5. **Done** — Files moved to `.archived/` folder for easy restore

---

## Features

- **Interactive TUI** — Navigate with arrow keys, type to filter
- **Safe by default** — Preview everything, double-Enter to confirm
- **Non-destructive** — Files are moved, not deleted
- **Search by title** — Find sessions by custom title pattern (e.g., "TO_DELETE")
- **Comprehensive** — Archives session files, companion folders, and agent sidechains

---

## Archive Types

| Type              | Description                          | Status    |
| ----------------- | ------------------------------------ | --------- |
| Unnamed sessions  | Conversations without a custom title | Available |
| Search by title   | Match sessions by title pattern      | Available |
| Older than N days | Archive by age                       | Planned   |
| By size           | Archive large/small sessions         | Planned   |

---

## CLI Flags

| Flag        | Description                            |
| ----------- | -------------------------------------- |
| `--dry-run` | Preview mode — no files will be moved  |
| `--dev`     | Development mode — for testing the app |

---

## What Gets Archived

For each session, the archiver moves:

1. **Session file** — `{session-id}.jsonl`
2. **Companion folder** — `{session-id}/` (attachments, if exists)
3. **Agent files** — `agent-*.jsonl` files linked to the session

All files go to `.archived/` within the project folder.

---

## FAQ

**Will this delete my important conversations?**
No. Files are moved to `.archived/`, not deleted. Named sessions are only touched if you explicitly search for them by title.

**Can I restore archived sessions?**
Yes. Just move files from `.archived/` back to the parent folder.

**Where does Claude Code store conversations?**
In `~/.claude/projects/`. Each project has its own folder with `.jsonl` session files.

**What are agent files?**
Sidechain conversations (like background tasks) that Claude Code creates. They're linked to a parent session and archived together.

---

## Requirements

- Node.js 22+
- Claude Code installed (with existing conversations)

---

## License

[MIT](./LICENSE) © [Martín M.](https://github.com/skydiver/)
