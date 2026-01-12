import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { OptionList, Spinner, type OptionItem } from '../ui';
import { getProjects, projectsDirExists } from '@/lib/projects';
import type { Project } from '@/types';

interface ProjectSelectProps {
  onSelect: (project: Project) => void;
}

export function ProjectSelect({ onSelect }: ProjectSelectProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      const exists = await projectsDirExists();
      if (!exists) {
        setError('Claude projects directory not found (~/.claude/projects)');
        setLoading(false);
        return;
      }

      const loadedProjects = await getProjects();
      if (loadedProjects.length === 0) {
        setError('No projects found with session files');
        setLoading(false);
        return;
      }

      setProjects(loadedProjects);
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
    return (
      <Layout title="Claude Code Archiver" footerActions={[{ key: 'Esc', label: 'Quit' }]}>
        <Text color="red">{error}</Text>
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
