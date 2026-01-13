import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { Spinner } from '../ui';
import { isDevMode } from '@/lib/archive';
import { getFilesToArchive, type ArchiveFileSet } from '@/lib/files';
import { formatSize } from '@/lib/sessions';
import type { Session } from '@/types';
import figures from 'figures';

interface ConfirmArchiveProps {
  sessions: Session[];
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmArchive({
  sessions,
  onConfirm,
  onBack,
}: ConfirmArchiveProps) {
  const [loading, setLoading] = useState(true);
  const [fileSets, setFileSets] = useState<ArchiveFileSet[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [confirmPending, setConfirmPending] = useState(false);

  useEffect(() => {
    async function load() {
      const sets = await getFilesToArchive(sessions);
      setFileSets(sets);
      setLoading(false);
    }
    load();
  }, [sessions]);

  const totalFiles = fileSets.reduce((sum, set) => sum + set.files.length, 0);
  const totalSize = fileSets.reduce((sum, set) => sum + set.totalSize, 0);

  useInput((input, key) => {
    // Navigation resets confirm state
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : fileSets.length - 1));
      setConfirmPending(false);
      return;
    }
    if (key.downArrow) {
      setCursor((prev) => (prev < fileSets.length - 1 ? prev + 1 : 0));
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
        onConfirm();
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
      <Layout title="Confirm Archive" subtitle="Scanning files...">
        <Spinner label="Gathering file information..." />
      </Layout>
    );
  }

  return (
    <Layout
      title="Confirm Archive"
      subtitle={`${totalFiles} files (${formatSize(totalSize)}) will be moved`}
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        {isDevMode() && (
          <Box marginBottom={1}>
            <Text color="yellow" bold>
              ⚠ DEV MODE - No files will actually be moved
            </Text>
          </Box>
        )}

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

        {/* Session list with expandable details */}
        {fileSets.map((fileSet, index) => {
          const isCursor = index === cursor;
          const isExpanded = expandedIndex === index;

          return (
            <Box key={fileSet.sessionId} flexDirection="column">
              {/* Session header */}
              <Box>
                <Text color={isCursor ? 'green' : 'white'} bold={isCursor}>
                  <Text color={isCursor ? 'green' : 'gray'}>
                    {isCursor ? figures.pointer : ' '}{' '}
                  </Text>
                  <Text color="gray">
                    {isExpanded ? figures.arrowDown : figures.arrowRight}{' '}
                  </Text>
                  {fileSet.sessionId.slice(0, 8)}...
                  <Text color="yellow"> ({fileSet.files.length} files, {formatSize(fileSet.totalSize)})</Text>
                </Text>
              </Box>

              {/* Expanded file list */}
              {isExpanded && (
                <Box flexDirection="column" marginLeft={4} marginBottom={1}>
                  {fileSet.files.map((file, fileIndex) => (
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
      </Box>
    </Layout>
  );
}
