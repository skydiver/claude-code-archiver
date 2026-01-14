import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { OptionList, Spinner, type OptionItem } from '../ui';
import { getProjects, type ProjectsErrorType } from '@/lib/projects';
import type { Project } from '@/types';
import figures from 'figures';

interface ProjectSelectProps {
  onSelect: (project: Project) => void;
}

interface ErrorInfo {
  type: ProjectsErrorType;
  message: string;
  hint: string;
}

function getErrorInfo(type: ProjectsErrorType, message: string | null): ErrorInfo {
  switch (type) {
    case 'not-found':
      return {
        type,
        message: message ?? 'Claude projects folder not found',
        hint: 'Make sure Claude Code has been used at least once',
      };
    case 'permission':
      return {
        type,
        message: message ?? 'Permission denied',
        hint: 'Check read permissions on ~/.claude/projects',
      };
    default:
      return {
        type,
        message: message ?? 'Unknown error',
        hint: 'Try running again or check the folder manually',
      };
  }
}

export function ProjectSelect({ onSelect }: ProjectSelectProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      const result = await getProjects();

      if (result.error) {
        setError(getErrorInfo(result.error, result.errorMessage));
        setLoading(false);
        return;
      }

      if (result.projects.length === 0) {
        setError({
          type: null,
          message: 'No projects found with session files',
          hint: 'Archive sessions after using Claude Code in some projects',
        });
        setLoading(false);
        return;
      }

      setProjects(result.projects);
      setLoading(false);
    }

    load();
  }, []);

  const handleSelect = (folderName: string) => {
    const project = projects.find((p) => p.folderName === folderName);
    if (project) {
      onSelect(project);
    }
  };

  const items: OptionItem<string>[] = projects.map((project) => ({
    label: project.readablePath,
    value: project.folderName,
    hint: `(${project.sessionCount} sessions)`,
  }));

  const footerActions = [
    { key: '↑↓', label: 'Navigate' },
    { key: 'Enter', label: 'Select' },
    { key: 'Esc', label: 'Quit' },
  ];

  if (loading) {
    return (
      <Layout title="Claude Code Archiver" subtitle="Loading projects...">
        <Spinner label="Scanning for projects..." />
      </Layout>
    );
  }

  if (error) {
    const icon = error.type === 'permission' ? figures.warning : figures.cross;
    const color = error.type === 'permission' ? 'yellow' : 'red';

    return (
      <Layout title="Claude Code Archiver" footerActions={[{ key: 'Esc', label: 'Quit' }]}>
        <Box flexDirection="column">
          <Box>
            <Text color={color}>
              {icon} {error.message}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              {figures.arrowRight} {error.hint}
            </Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout
      title="Claude Code Archiver"
      subtitle="Select a project to scan for archivable sessions"
      footerActions={footerActions}
    >
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="gray">
            Found {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Text>
        </Box>
        <OptionList items={items} onSelect={handleSelect} />
      </Box>
    </Layout>
  );
}
