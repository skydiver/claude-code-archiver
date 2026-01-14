import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { Spinner } from '../ui';
import { getSessions, filterSessions, formatSize, truncate } from '@/lib/sessions';
import { getFilesToArchive, type ArchiveFileSet } from '@/lib/files';
import type { ArchiveType, Project, Session } from '@/types';
import figures from 'figures';

interface SessionPreviewProps {
  project: Project;
  archiveType: ArchiveType;
  titlePattern?: string;
  onConfirm: (sessions: Session[]) => void;
  onBack: () => void;
}

interface ErrorInfo {
  message: string;
  hint: string;
}

export function SessionPreview({
  project,
  archiveType,
  titlePattern,
  onConfirm,
  onBack,
}: SessionPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fileSets, setFileSets] = useState<ArchiveFileSet[]>([]);
  const [cursor, setCursor] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [confirmPending, setConfirmPending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const allSessions = await getSessions(project);
        const filteredSessions = filterSessions(allSessions, archiveType, titlePattern);
        setSessions(filteredSessions);

        // Get file details for each session
        const sets = await getFilesToArchive(filteredSessions);
        setFileSets(sets);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load sessions';
        setError({
          message,
          hint: 'Try selecting a different project or check folder permissions',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [project, archiveType]);

  const totalFiles = fileSets.reduce((sum, set) => sum + set.files.length, 0);
  const totalSize = fileSets.reduce((sum, set) => sum + set.totalSize, 0);

  useInput((input, key) => {
    if (loading || sessions.length === 0) {
      if (key.escape || key.backspace || key.leftArrow) {
        onBack();
      }
      return;
    }

    // Navigation resets confirm state
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : sessions.length - 1));
      setConfirmPending(false);
      return;
    }
    if (key.downArrow) {
      setCursor((prev) => (prev < sessions.length - 1 ? prev + 1 : 0));
      setConfirmPending(false);
      return;
    }

    // Toggle expand/collapse with space or right arrow
    if (input === ' ' || key.rightArrow) {
      setExpandedIndex((prev) => (prev === cursor ? null : cursor));
      setConfirmPending(false);
      return;
    }

    // Double-Enter to confirm
    if (key.return) {
      if (confirmPending) {
        onConfirm(sessions);
      } else {
        setConfirmPending(true);
      }
      return;
    }

    // Back (resets confirm state first)
    if (key.escape || key.backspace || key.leftArrow) {
      if (confirmPending) {
        setConfirmPending(false);
      } else if (expandedIndex !== null) {
        setExpandedIndex(null);
      } else {
        onBack();
      }
      return;
    }
  });

  const footerActions = confirmPending
    ? [
        { key: 'Enter', label: 'Yes, Archive!' },
        { key: 'Esc', label: 'Cancel' },
      ]
    : [
        { key: '↑↓', label: 'Navigate' },
        { key: 'Space', label: 'Expand' },
        { key: 'Enter', label: 'Archive' },
        { key: 'Esc', label: 'Back' },
      ];

  if (loading) {
    return (
      <Layout title="Session Preview" subtitle="Loading sessions...">
        <Spinner label="Scanning sessions..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Session Preview"
        subtitle="Error loading sessions"
        footerActions={[{ key: 'Esc', label: 'Back' }]}
      >
        <Box flexDirection="column">
          <Box>
            <Text color="red">
              {figures.cross} {error.message}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              {figures.arrowRight} {error.hint}
            </Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (sessions.length === 0) {
    return (
      <Layout
        title="Session Preview"
        subtitle="No archivable sessions found"
        footerActions={[{ key: 'Esc', label: 'Back' }]}
      >
        <Text color="yellow">
          No unnamed sessions found in the selected project.
        </Text>
      </Layout>
    );
  }

  // Build subtitle based on archive type
  const subtitleText = archiveType === 'by-title'
    ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} matching "${titlePattern}" (${totalFiles} files, ${formatSize(totalSize)})`
    : `${sessions.length} unnamed session${sessions.length !== 1 ? 's' : ''} (${totalFiles} files, ${formatSize(totalSize)}) to archive`;

  return (
    <Layout
      title="Session Preview"
      subtitle={subtitleText}
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        <Box flexDirection="column" marginBottom={1}>
          <Text color="gray">
            Files will be moved to <Text color="white">.archived/</Text> folder
          </Text>
          <Text color="gray" dimColor>
            Press Space to expand and see files for each session
          </Text>
        </Box>

        {/* Confirmation prompt */}
        {confirmPending && (
          <Box marginBottom={1}>
            <Text color="red" bold>
              {figures.warning} Press Enter again to confirm, or Esc to cancel
            </Text>
          </Box>
        )}

        {/* Table header */}
        <Box>
          <Text color="gray">{'   '}</Text>
          <Text color="gray" bold>{'Session ID'.padEnd(11)}</Text>
          <Text color="gray" bold>{(archiveType === 'by-title' ? 'Title' : 'Summary').padEnd(40)}</Text>
          <Text color="gray" bold>{'Files'.padEnd(8)}</Text>
          <Text color="gray" bold>{'Size'.padStart(10)}</Text>
        </Box>
        <Box marginBottom={0}>
          <Text color="gray">{'─'.repeat(72)}</Text>
        </Box>

        {/* Session list with expandable details */}
        {fileSets.map((fileSet, index) => {
          const session = sessions[index];
          const isCursor = index === cursor;
          const isExpanded = expandedIndex === index;
          const displayText = archiveType === 'by-title'
            ? (session?.customTitle ? truncate(session.customTitle, 38) : '—')
            : (session?.summary ? truncate(session.summary, 38) : '—');
          const filesText = `${fileSet.files.length} file${fileSet.files.length !== 1 ? 's' : ''}`;

          return (
            <Box key={fileSet.sessionId} flexDirection="column">
              {/* Session row */}
              <Box>
                <Text color={isCursor ? 'green' : 'gray'}>
                  {isCursor ? figures.pointer : ' '}{' '}
                </Text>
                <Text color="gray">
                  {isExpanded ? figures.arrowDown : figures.arrowRight}
                </Text>
                <Text color={isCursor ? 'green' : 'white'} bold={isCursor}>
                  {fileSet.sessionId.slice(0, 9).padEnd(11)}
                </Text>
                <Text color={isCursor ? 'green' : 'white'}>
                  {displayText.padEnd(40)}
                </Text>
                <Text color="yellow">
                  {filesText.padEnd(8)}
                </Text>
                <Text color="yellow">
                  {formatSize(fileSet.totalSize).padStart(10)}
                </Text>
              </Box>

              {/* Expanded file list */}
              {isExpanded && (
                <Box flexDirection="column" marginLeft={4} marginBottom={1}>
                  {fileSet.files.map((file: { type: string; name: string; size: number }, fileIndex: number) => (
                    <Box key={fileIndex}>
                      <Text color="gray">
                        {file.type === 'folder' || file.type === 'agent-folder'
                          ? figures.hamburger
                          : figures.circleFilled}{' '}
                        {file.name}
                        <Text dimColor> ({formatSize(file.size)})</Text>
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}

        {/* Total size footer */}
        <Box marginTop={1}>
          <Text color="gray">{'─'.repeat(72)}</Text>
        </Box>
        <Box>
          <Text color="gray">
            Total size: {formatSize(totalSize)}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
