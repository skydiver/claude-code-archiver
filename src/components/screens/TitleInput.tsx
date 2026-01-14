import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { Layout } from '../layout';
import type { Project } from '@/types';
import figures from 'figures';

interface TitleInputProps {
  project: Project;
  onSubmit: (pattern: string) => void;
  onBack: () => void;
}

export function TitleInput({ project, onSubmit, onBack }: TitleInputProps) {
  const [value, setValue] = useState('');

  useInput((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }

    if (key.return && value.trim()) {
      onSubmit(value.trim());
      return;
    }

    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }

    // Only allow printable characters
    if (input && !key.ctrl && !key.meta) {
      setValue((prev) => prev + input);
    }
  });

  const footerActions = [
    { key: 'Enter', label: 'Search' },
    { key: 'Esc', label: 'Back' },
  ];

  return (
    <Layout
      title="Search by Title"
      subtitle="Enter a title pattern to match"
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="gray">
            Project: {project.readablePath}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color="gray">
            Sessions with titles containing your search text will be shown.
          </Text>
        </Box>

        {/* Input field */}
        <Box>
          <Text color="green">{figures.pointer} </Text>
          <Text>Title pattern: </Text>
          <Text color="cyan" bold>{value}</Text>
          <Text color="gray">{'█'}</Text>
        </Box>

        {/* Example hint */}
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Example: "delete" matches "TO_DELETE", "delete me", "old_delete_2023"
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
