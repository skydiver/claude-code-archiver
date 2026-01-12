import { Box, Text } from 'ink';
import { Layout } from '../layout';
import { OptionList, type OptionItem } from '../ui';
import type { ArchiveType, Project } from '@/types';

interface ArchiveTypeSelectProps {
  project: Project;
  onSelect: (archiveType: ArchiveType) => void;
  onBack: () => void;
}

export function ArchiveTypeSelect({
  project,
  onSelect,
  onBack,
}: ArchiveTypeSelectProps) {
  const items: OptionItem<ArchiveType>[] = [
    {
      label: 'Unnamed sessions',
      value: 'unnamed',
      hint: '(sessions without a custom title)',
    },
    {
      label: 'Older than N days',
      value: 'older-than',
      hint: '(coming soon)',
      disabled: true,
    },
    {
      label: 'By size threshold',
      value: 'by-size',
      hint: '(coming soon)',
      disabled: true,
    },
  ];

  const footerActions = [
    { key: '↑↓', label: 'Navigate' },
    { key: 'Enter', label: 'Select' },
    { key: 'Esc', label: 'Back' },
  ];

  return (
    <Layout
      title="Archive Type"
      subtitle="Choose which sessions to archive"
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="gray">
            Project: {project.readablePath}
          </Text>
        </Box>
        <OptionList items={items} onSelect={onSelect} onBack={onBack} />
      </Box>
    </Layout>
  );
}
