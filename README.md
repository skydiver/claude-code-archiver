# Claude Code Archiver

A terminal app to clean up old Claude Code conversations and free up disk space.

---

## The Problem

[Claude Code](https://claude.ai/code) stores every conversation in `~/.claude/projects/` as `.jsonl` files. Over time, these pile up and can take gigabytes of space — especially if you use Claude Code daily.

**But not all conversations are worth keeping.** Quick questions, abandoned experiments, and one-off debugging sessions clutter your history.

## The Solution

Claude Code Archiver helps you:

- **Find** conversations that haven't been named (unnamed = probably not important)
- **Preview** what will be archived before taking action
- **Archive** old sessions by compressing them to `.zip` files
- **Free up space** while keeping a backup just in case

Named conversations (ones you've given a custom title) are **never touched** — they're clearly important to you.

---

## Usage

Run directly without installing:

```bash
npx github:skydiver/claude-code-archiver
```

Or with preview mode (no changes made):

```bash
npx github:skydiver/claude-code-archiver --dry-run
```

---

## How It Works

1. **Select projects** — Choose which Claude Code projects to scan
2. **Pick archive criteria** — Currently: "unnamed sessions" (more options coming)
3. **Review sessions** — See what will be archived with file sizes
4. **Confirm** — Archives are created in each project's `.archived/` folder
5. **Done** — Original files are removed, zips remain as backup

---

## Features

- **Interactive TUI** — Navigate with arrow keys, no commands to memorize
- **Safe by default** — Preview everything before archiving
- **Non-destructive** — Creates zip backups before deleting originals
- **Selective** — Only targets unnamed sessions; named ones stay untouched
- **Fast** — Built with modern tooling for quick startup

---

## Screenshots

*Coming soon*

---

## Requirements

- Node.js 22 or later
- Claude Code installed (with existing conversations)

---

## Archive Types

| Type | Description | Status |
|------|-------------|--------|
| Unnamed sessions | Conversations without a custom title | Available |
| Older than N days | Archive by age | Planned |
| By size | Archive large/small sessions | Planned |

---

## FAQ

**Will this delete my important conversations?**
No. Only unnamed sessions are archived. If you've given a conversation a title, it's safe.

**Can I restore archived sessions?**
Yes. Archives are stored as `.zip` files in `.archived/` within each project folder. Unzip to restore.

**Where does Claude Code store conversations?**
In `~/.claude/projects/`. Each project has its own folder with `.jsonl` session files.

---

## License

[MIT](./LICENSE) © [Martín M.](https://github.com/skydiver/)
