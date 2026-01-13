import { Box, Text } from 'ink';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { getModeInfo } from '@/lib/config';
import figures from 'figures';

interface FooterAction {
  key: string;
  label: string;
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footerActions?: FooterAction[];
  showFooter?: boolean;
}

export function Layout({
  children,
  title,
  subtitle,
  footerActions,
  showFooter = true,
}: LayoutProps) {
  const modeInfo = getModeInfo();

  return (
    <Box flexDirection="column" padding={1}>
      {/* Mode banner - very visible at the top */}
      {modeInfo && (
        <Box marginBottom={1}>
          <Text color="black" backgroundColor={modeInfo.color} bold>
            {' '}{figures.warning} {modeInfo.message.toUpperCase()} {figures.warning}{' '}
          </Text>
        </Box>
      )}

      <Header {...(title ? { title } : {})} {...(subtitle ? { subtitle } : {})} />
      <Box flexDirection="column" paddingX={1}>
        {children}
      </Box>
      {showFooter && <Footer {...(footerActions ? { actions: footerActions } : {})} />}
    </Box>
  );
}
