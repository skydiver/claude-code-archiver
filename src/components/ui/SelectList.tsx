import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import figures from 'figures';

export interface SelectItem<T> {
  label: string;
  value: T;
  hint?: string;
}

interface SelectListProps<T> {
  items: SelectItem<T>[];
  selected: T[];
  onSelect: (selected: T[]) => void;
  onSubmit: () => void;
  onBack?: () => void;
}

export function SelectList<T>({
  items,
  selected,
  onSelect,
  onSubmit,
  onBack,
}: SelectListProps<T>) {
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    // Navigation
    if (key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    }
    if (key.downArrow) {
      setCursor((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    }

    // Toggle selection with space
    if (input === ' ') {
      const item = items[cursor];
      if (!item) return;

      const isSelected = selected.includes(item.value);
      if (isSelected) {
        onSelect(selected.filter((v) => v !== item.value));
      } else {
        onSelect([...selected, item.value]);
      }
    }

    // Select all
    if (input === 'a') {
      onSelect(items.map((item) => item.value));
    }

    // Select none
    if (input === 'n') {
      onSelect([]);
    }

    // Submit
    if (key.return) {
      onSubmit();
    }

    // Back
    if (onBack && (key.escape || key.backspace || key.leftArrow)) {
      onBack();
    }

    // Quit
    if (input === 'q') {
      process.exit(0);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const isSelected = selected.includes(item.value);
        const isCursor = index === cursor;

        return (
          <Box key={index}>
            <Text
              {...(isCursor ? { color: 'green', inverse: true, bold: true } : {})}
            >
              {' '}
              <Text color={isSelected ? 'green' : 'gray'}>
                {isSelected ? figures.radioOn : figures.radioOff}
              </Text>
              {' '}
              {item.label}
              {item.hint && (
                <Text color="gray" dimColor>
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
