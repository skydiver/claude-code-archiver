import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { ProgressBar, Spinner } from '../ui';
import { archiveSessions, type ArchiveResult } from '@/lib/archive';
import { truncateId } from '@/lib/sessions';
import type { Session } from '@/types';
import figures from 'figures';

interface ProgressProps {
  sessions: Session[];
  onComplete: (results: ArchiveResult[]) => void;
}

interface ProgressState {
  completed: number;
  total: number;
  current: Session | null;
  results: ArchiveResult[];
}

export function Progress({ sessions, onComplete }: ProgressProps) {
  const [state, setState] = useState<ProgressState>({
    completed: 0,
    total: sessions.length,
    current: null,
    results: [],
  });

  useEffect(() => {
    async function runArchive() {
      const results = await archiveSessions(sessions, (completed, total, current) => {
        setState((prev) => ({
          ...prev,
          completed,
          current,
        }));
      });

      setState((prev) => ({
        ...prev,
        completed: sessions.length,
        current: null,
        results,
      }));

      // Brief delay to show completion
      setTimeout(() => {
        onComplete(results);
      }, 500);
    }

    runArchive();
  }, [sessions, onComplete]);

  return (
    <Layout
      title="Archiving Sessions"
      subtitle={`${state.completed} of ${state.total} completed`}
      showFooter={false}
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <ProgressBar
            value={state.completed}
            total={state.total}
            width={40}
          />
        </Box>

        {/* Recent results */}
        <Box flexDirection="column" marginBottom={1}>
          {state.results.slice(-5).map((result, index) => (
            <Box key={index}>
              <Text color={result.success ? 'green' : 'red'}>
                {result.success ? figures.tick : figures.cross}
              </Text>
              <Text> {truncateId(result.session.id)}</Text>
              {result.error && (
                <Text color="red" dimColor> - {result.error}</Text>
              )}
            </Box>
          ))}
        </Box>

        {/* Current item */}
        {state.current && (
          <Box>
            <Spinner />
            <Text> Processing: {truncateId(state.current.id)}</Text>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
