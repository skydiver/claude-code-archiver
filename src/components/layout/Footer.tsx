import { Box, Text } from 'ink';

interface FooterAction {
  key: string;
  label: string;
}

interface FooterProps {
  actions?: FooterAction[];
}

const DEFAULT_ACTIONS: FooterAction[] = [
  { key: 'q', label: 'Quit' },
];

export function Footer({ actions = DEFAULT_ACTIONS }: FooterProps) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="gray">{'─'.repeat(72)}</Text>
      </Box>
      <Box gap={2}>
        {actions.map((action, index) => (
          <Box key={index}>
            <Text color="yellow">[{action.key}]</Text>
            <Text color="gray"> {action.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
