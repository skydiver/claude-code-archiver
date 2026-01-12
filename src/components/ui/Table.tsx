import { Box, Text } from 'ink';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
  render?: (row: T) => string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  maxRows?: number;
}

export function Table<T>({
  columns,
  data,
  maxRows,
}: TableProps<T>) {
  const displayData = maxRows ? data.slice(0, maxRows) : data;
  const hasMore = maxRows && data.length > maxRows;

  const getCellValue = (row: T, column: Column<T>): string => {
    if (column.render) {
      return column.render(row);
    }
    const value = row[column.key as keyof T];
    return value !== undefined ? String(value) : '';
  };

  const pad = (str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string => {
    if (str.length >= width) {
      return str.slice(0, width);
    }
    const padding = width - str.length;
    switch (align) {
      case 'right':
        return ' '.repeat(padding) + str;
      case 'center':
        const left = Math.floor(padding / 2);
        return ' '.repeat(left) + str + ' '.repeat(padding - left);
      default:
        return str + ' '.repeat(padding);
    }
  };

  return (
    <Box flexDirection="column">
      {/* Header row */}
      <Box>
        {columns.map((col, i) => (
          <Text key={i} color="cyan" bold>
            {pad(col.header, col.width ?? 20, col.align)}
            {i < columns.length - 1 ? '  ' : ''}
          </Text>
        ))}
      </Box>

      {/* Separator */}
      <Box>
        <Text color="gray">
          {columns.map((col, i) =>
            '─'.repeat(col.width ?? 20) + (i < columns.length - 1 ? '──' : '')
          ).join('')}
        </Text>
      </Box>

      {/* Data rows */}
      {displayData.map((row, rowIndex) => (
        <Box key={rowIndex}>
          {columns.map((col, colIndex) => (
            <Text key={colIndex}>
              {pad(getCellValue(row, col), col.width ?? 20, col.align)}
              {colIndex < columns.length - 1 ? '  ' : ''}
            </Text>
          ))}
        </Box>
      ))}

      {/* More indicator */}
      {hasMore && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            ... and {data.length - maxRows} more
          </Text>
        </Box>
      )}
    </Box>
  );
}
