import { Box, Text, useInput } from 'ink';
import { Layout } from '../layout';
import { getArchiveSummary, isDevMode, type ArchiveResult } from '@/lib/archive';
import { formatSize, truncateId } from '@/lib/sessions';
import figures from 'figures';

interface SummaryProps {
  results: ArchiveResult[];
  onRestart: () => void;
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
      {...(isDevMode() ? { subtitle: 'DEV MODE - No files were modified' } : {})}
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
            {failed.map((result, index) => (
              <Box key={index}>
                <Text color="red">{figures.cross} </Text>
                <Text>{truncateId(result.session.id)}</Text>
                <Text color="gray" dimColor> - {result.error}</Text>
              </Box>
            ))}
          </Box>
        )}

        {/* Dev mode reminder */}
        {isDevMode() && (
          <Box marginTop={1}>
            <Text color="yellow">
              {figures.warning} Run with NODE_ENV=production to actually archive files
            </Text>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
