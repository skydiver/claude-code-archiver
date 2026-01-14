import { Box, Text, useInput } from 'ink';
import { Layout } from '../layout';
import { getArchiveSummary, type ArchiveResult } from '@/lib/archive';
import { formatSize, truncateId } from '@/lib/sessions';
import type { ArchiveErrorType } from '@/types';
import figures from 'figures';

interface SummaryProps {
  results: ArchiveResult[];
  onRestart: () => void;
}

/**
 * Get display info for an error type
 */
function getErrorDisplay(errorType: ArchiveErrorType | undefined): { icon: string; color: string } {
  switch (errorType) {
    case 'permission':
      return { icon: figures.warning, color: 'yellow' };
    case 'already-exists':
      return { icon: figures.info, color: 'cyan' };
    case 'disk-full':
      return { icon: figures.warning, color: 'red' };
    case 'not-found':
      return { icon: figures.cross, color: 'gray' };
    default:
      return { icon: figures.cross, color: 'red' };
  }
}

export function Summary({ results, onRestart }: SummaryProps) {
  const summary = getArchiveSummary(results);
  const failed = results.filter((r) => !r.success);

  useInput((input, key) => {
    if (key.return || input === 'r') {
      onRestart();
    }
    if (key.escape) {
      process.exit(0);
    }
  });

  const footerActions = [
    { key: 'r', label: 'Archive More' },
    { key: 'Esc', label: 'Quit' },
  ];

  return (
    <Layout
      title="Archive Complete"
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        {/* Summary stats */}
        <Box flexDirection="column" marginBottom={1}>
          <Box>
            <Text color="green">{figures.tick} Successful: </Text>
            <Text bold>{summary.successful}</Text>
          </Box>
          {summary.failed > 0 && (
            <Box>
              <Text color="red">{figures.cross} Failed: </Text>
              <Text bold>{summary.failed}</Text>
            </Box>
          )}
          <Box>
            <Text color="cyan">{figures.info} Total size archived: </Text>
            <Text bold>{formatSize(summary.totalSize)}</Text>
          </Box>
        </Box>

        {/* Failed items */}
        {failed.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="red" bold>Failed sessions:</Text>
            {failed.map((result, index) => {
              const { icon, color } = getErrorDisplay(result.errorType);
              return (
                <Box key={index}>
                  <Text color={color}>{icon} </Text>
                  <Text>{truncateId(result.session.id)}</Text>
                  <Text color="gray"> — </Text>
                  <Text color={color}>{result.error}</Text>
                </Box>
              );
            })}
          </Box>
        )}

      </Box>
    </Layout>
  );
}
