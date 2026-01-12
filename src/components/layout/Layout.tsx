import { Box } from 'ink';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

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
  return (
    <Box flexDirection="column" padding={1}>
      <Header {...(title ? { title } : {})} {...(subtitle ? { subtitle } : {})} />
      <Box flexDirection="column" paddingX={1}>
        {children}
      </Box>
      {showFooter && <Footer {...(footerActions ? { actions: footerActions } : {})} />}
    </Box>
  );
}
