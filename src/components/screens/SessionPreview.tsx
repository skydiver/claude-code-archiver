import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { Spinner, Table, type Column } from '../ui';
import { getSessions, filterSessions, formatSize, getTotalSize, truncateId, truncate } from '@/lib/sessions';
import { isDevMode } from '@/lib/archive';
import type { ArchiveType, Project, Session } from '@/types';

interface SessionPreviewProps {
  project: Project;
  archiveType: ArchiveType;
  onConfirm: (sessions: Session[]) => void;
  onBack: () => void;
}

interface SessionRow {
  id: string;
  summary: string;
  size: string;
}

export function SessionPreview({
  project,
  archiveType,
  onConfirm,
  onBack,
}: SessionPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function load() {
      const allSessions = await getSessions(project);
      const filteredSessions = filterSessions(allSessions, archiveType);
      setSessions(filteredSessions);
      setLoading(false);
    }

    load();
  }, [project, archiveType]);

  useInput((_input, key) => {
    if (key.return && sessions.length > 0) {
      onConfirm(sessions);
    }
    if (key.escape || key.backspace || key.leftArrow) {
      onBack();
    }
  });

  const columns: Column<SessionRow>[] = [
    { key: 'id', header: 'Session ID', width: 12 },
    { key: 'summary', header: 'Summary', width: 30 },
    { key: 'size', header: 'Size', width: 10, align: 'right' },
  ];

  // Calculate table width: sum of column widths + 2-char gaps between columns
  const tableWidth = columns.reduce((sum, col, i) => {
    return sum + (col.width ?? 20) + (i < columns.length - 1 ? 2 : 0);
  }, 0);

  const data: SessionRow[] = sessions.map((session) => ({
    id: truncateId(session.id),
    summary: session.summary ? truncate(session.summary, 28) : '(no summary)',
    size: formatSize(session.size),
  }));

  const footerActions = [
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

  if (sessions.length === 0) {
    return (
      <Layout
        title="Session Preview"
        subtitle="No archivable sessions found"
        footerActions={[
          { key: 'Esc', label: 'Back' },
        ]}
      >
        <Text color="yellow">
          No unnamed sessions found in the selected project.
        </Text>
      </Layout>
    );
  }

  return (
    <Layout
      title="Session Preview"
      subtitle={`${sessions.length} unnamed session${sessions.length !== 1 ? 's' : ''} to archive`}
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        {isDevMode() && (
          <Box marginBottom={1}>
            <Text color="yellow" bold>
              ⚠ DEV MODE - Destructive operations disabled
            </Text>
          </Box>
        )}
        <Table columns={columns} data={data} maxRows={15} />
        <Box marginTop={1}>
          <Text color="gray">{'─'.repeat(tableWidth)}</Text>
        </Box>
        <Box>
          <Text color="gray">
            Total size: {formatSize(getTotalSize(sessions))}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
