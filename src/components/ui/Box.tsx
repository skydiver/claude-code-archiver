import { Box as InkBox, Text } from 'ink';
import type { ReactNode } from 'react';

interface BoxProps {
  children: ReactNode;
  title?: string;
  width?: number | string;
  padding?: number;
  borderColor?: string;
}

// Box drawing characters
const CHARS = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  titleLeft: '─ ',
  titleRight: ' ─',
};

export function Box({
  children,
  title,
  width = '100%',
  padding = 1,
  borderColor = 'gray',
}: BoxProps) {
  return (
    <InkBox flexDirection="column" width={width}>
      {/* Top border with optional title */}
      <Text color={borderColor}>
        {CHARS.topLeft}
        {title ? (
          <>
            {CHARS.titleLeft}
            <Text color="cyan" bold>
              {title}
            </Text>
            {CHARS.titleRight}
          </>
        ) : null}
        {CHARS.horizontal.repeat(20)}
        {CHARS.topRight}
      </Text>

      {/* Content with side borders */}
      <InkBox flexDirection="row">
        <Text color={borderColor}>{CHARS.vertical}</Text>
        <InkBox flexDirection="column" paddingX={padding} flexGrow={1}>
          {children}
        </InkBox>
        <Text color={borderColor}>{CHARS.vertical}</Text>
      </InkBox>

      {/* Bottom border */}
      <Text color={borderColor}>
        {CHARS.bottomLeft}
        {CHARS.horizontal.repeat(22 + (title?.length ?? 0))}
        {CHARS.bottomRight}
      </Text>
    </InkBox>
  );
}
