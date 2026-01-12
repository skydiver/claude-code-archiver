import { Box, Text } from 'ink';
import figures from 'figures';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = 'Claude Code Archiver', subtitle }: HeaderProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color="cyan" bold>
          {figures.arrowRight} {title}
        </Text>
      </Box>
      {subtitle && (
        <Box>
          <Text color="gray">{subtitle}</Text>
        </Box>
      )}
      <Box>
        <Text color="gray">{'─'.repeat(50)}</Text>
      </Box>
    </Box>
  );
}
