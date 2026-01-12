import { Box, Text } from 'ink';

interface ProgressBarProps {
  value: number;
  total: number;
  width?: number;
  showPercentage?: boolean;
  showCount?: boolean;
  filledChar?: string;
  emptyChar?: string;
  filledColor?: string;
  emptyColor?: string;
}

export function ProgressBar({
  value,
  total,
  width = 30,
  showPercentage = true,
  showCount = true,
  filledChar = '█',
  emptyChar = '░',
  filledColor = 'green',
  emptyColor = 'gray',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const filledWidth = total > 0 ? Math.round((value / total) * width) : 0;
  const emptyWidth = width - filledWidth;

  return (
    <Box>
      <Text color={filledColor}>{filledChar.repeat(filledWidth)}</Text>
      <Text color={emptyColor}>{emptyChar.repeat(emptyWidth)}</Text>
      {showPercentage && (
        <Text color="cyan" bold>
          {' '}{percentage}%
        </Text>
      )}
      {showCount && (
        <Text color="gray">
          {' '}({value}/{total})
        </Text>
      )}
    </Box>
  );
}
