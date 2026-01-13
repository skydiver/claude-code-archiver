import { Box, Text } from 'ink';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const WIDTH = 52;

export function Header({ title = 'Claude Code Archiver', subtitle }: HeaderProps) {
  const innerWidth = WIDTH - 2; // Account for side borders
  const emptyLine = ' '.repeat(innerWidth);
  const paddedTitle = ` 📦 ${title} `.padEnd(innerWidth);

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Top border */}
      <Box>
        <Text color="green">╭</Text>
        <Text color="green">{'─'.repeat(WIDTH - 2)}</Text>
        <Text color="green">╮</Text>
      </Box>

      {/* Empty line */}
      <Box>
        <Text color="green">│</Text>
        <Text>{emptyLine}</Text>
        <Text color="green">│</Text>
      </Box>

      {/* Title row */}
      <Box>
        <Text color="green">│</Text>
        <Text color="white" bold>{paddedTitle}</Text>
        <Text color="green">│</Text>
      </Box>

      {/* Empty line */}
      <Box>
        <Text color="green">│</Text>
        <Text>{emptyLine}</Text>
        <Text color="green">│</Text>
      </Box>

      {/* Bottom border */}
      <Box>
        <Text color="green">╰</Text>
        <Text color="green">{'─'.repeat(WIDTH - 2)}</Text>
        <Text color="green">╯</Text>
      </Box>

      {/* Subtitle below banner */}
      {subtitle && (
        <Box marginTop={1}>
          <Text color="cyan" bold>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
}
