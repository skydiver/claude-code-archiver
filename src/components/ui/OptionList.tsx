import { Box, Text, useInput } from 'ink';
import { useState, useMemo } from 'react';
import figures from 'figures';

export interface OptionItem<T> {
  label: string;
  value: T;
  hint?: string;
  disabled?: boolean;
}

interface OptionListProps<T> {
  items: OptionItem<T>[];
  onSelect: (value: T) => void;
  onBack?: () => void;
}

export function OptionList<T>({
  items,
  onSelect,
  onBack,
}: OptionListProps<T>) {
  const [cursor, setCursor] = useState(0);
  const [filter, setFilter] = useState('');

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const lower = filter.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lower));
  }, [items, filter]);

  useInput((input, key) => {
    // Navigation
    if (key.upArrow) {
      setCursor((prev) => {
        let next = prev > 0 ? prev - 1 : filteredItems.length - 1;
        while (filteredItems[next]?.disabled && next !== prev) {
          next = next > 0 ? next - 1 : filteredItems.length - 1;
        }
        return next;
      });
      return;
    }
    if (key.downArrow) {
      setCursor((prev) => {
        let next = prev < filteredItems.length - 1 ? prev + 1 : 0;
        while (filteredItems[next]?.disabled && next !== prev) {
          next = next < filteredItems.length - 1 ? next + 1 : 0;
        }
        return next;
      });
      return;
    }

    // Select with enter
    if (key.return) {
      const item = filteredItems[cursor];
      if (item && !item.disabled) {
        onSelect(item.value);
      }
      return;
    }

    // Escape: clear filter, go back, or quit
    if (key.escape) {
      if (filter) {
        setFilter('');
        setCursor(0);
      } else if (onBack) {
        onBack();
      } else {
        process.exit(0);
      }
      return;
    }

    // Backspace: remove char from filter or go back
    if (key.backspace || key.delete) {
      if (filter) {
        setFilter((prev) => prev.slice(0, -1));
        setCursor(0);
      } else if (onBack) {
        onBack();
      }
      return;
    }

    // Left arrow: go back (only if no filter)
    if (key.leftArrow && !filter && onBack) {
      onBack();
      return;
    }

    // Type to filter (printable characters)
    if (input && !key.ctrl && !key.meta) {
      setFilter((prev) => prev + input);
      setCursor(0);
    }
  });

  return (
    <Box flexDirection="column">
      {/* Search indicator */}
      {filter && (
        <Box marginBottom={1}>
          <Text color="cyan">
            {figures.arrowRight} Search: {filter}
          </Text>
          <Text color="gray"> ({filteredItems.length} matches)</Text>
        </Box>
      )}

      {/* No results */}
      {filteredItems.length === 0 && (
        <Text color="yellow">No matches found</Text>
      )}

      {/* Items */}
      {filteredItems.map((item, index) => {
        const isCursor = index === cursor;
        const isDisabled = item.disabled;

        const textProps = isDisabled
          ? { color: 'gray' as const, dimColor: true }
          : isCursor
            ? { color: 'green' as const, bold: true }
            : {};

        return (
          <Box key={index}>
            <Text {...textProps}>
              {' '}
              <Text color={isCursor && !isDisabled ? 'green' : 'gray'}>
                {isCursor ? figures.pointer : ' '}
              </Text>
              {' '}
              {item.label}
              {item.hint && (
                <Text color="yellow">
                  {' '}
                  {item.hint}
                </Text>
              )}
              {' '}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
