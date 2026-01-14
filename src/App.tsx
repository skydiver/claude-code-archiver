import { useState, useCallback } from 'react';
import {
  ArchiveTypeSelect,
  Progress,
  ProjectSelect,
  SessionPreview,
  Summary,
  TitleInput,
} from './components/screens';
import type { ArchiveResult } from './lib/archive';
import type { ArchiveType, Project, Screen, Session } from './types';

export function App() {
  const [screen, setScreen] = useState<Screen>('project-select');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [archiveType, setArchiveType] = useState<ArchiveType>('unnamed');
  const [titlePattern, setTitlePattern] = useState<string>('');
  const [sessionsToArchive, setSessionsToArchive] = useState<Session[]>([]);
  const [archiveResults, setArchiveResults] = useState<ArchiveResult[]>([]);

  const handleProjectSelected = useCallback((project: Project) => {
    setSelectedProject(project);
    setScreen('archive-type');
  }, []);

  const handleArchiveTypeSelected = useCallback((type: ArchiveType) => {
    setArchiveType(type);
    if (type === 'by-title') {
      setScreen('title-input');
    } else {
      setScreen('session-preview');
    }
  }, []);

  const handleTitlePatternSubmit = useCallback((pattern: string) => {
    setTitlePattern(pattern);
    setScreen('session-preview');
  }, []);

  const handleSessionsConfirmed = useCallback((sessions: Session[]) => {
    setSessionsToArchive(sessions);
    setScreen('progress');
  }, []);

  const handleArchiveComplete = useCallback((results: ArchiveResult[]) => {
    setArchiveResults(results);
    setScreen('summary');
  }, []);

  const handleRestart = useCallback(() => {
    setSelectedProject(null);
    setArchiveType('unnamed');
    setSessionsToArchive([]);
    setArchiveResults([]);
    setScreen('project-select');
  }, []);

  const handleBackToProjects = useCallback(() => {
    setScreen('project-select');
  }, []);

  const handleBackToArchiveType = useCallback(() => {
    setScreen('archive-type');
  }, []);

  switch (screen) {
    case 'project-select':
      return <ProjectSelect onSelect={handleProjectSelected} />;

    case 'archive-type':
      if (!selectedProject) return <ProjectSelect onSelect={handleProjectSelected} />;
      return (
        <ArchiveTypeSelect
          project={selectedProject}
          onSelect={handleArchiveTypeSelected}
          onBack={handleBackToProjects}
        />
      );

    case 'title-input':
      if (!selectedProject) return <ProjectSelect onSelect={handleProjectSelected} />;
      return (
        <TitleInput
          project={selectedProject}
          onSubmit={handleTitlePatternSubmit}
          onBack={handleBackToArchiveType}
        />
      );

    case 'session-preview':
      if (!selectedProject) return <ProjectSelect onSelect={handleProjectSelected} />;
      return (
        <SessionPreview
          project={selectedProject}
          archiveType={archiveType}
          titlePattern={titlePattern}
          onConfirm={handleSessionsConfirmed}
          onBack={archiveType === 'by-title' ? () => setScreen('title-input') : handleBackToArchiveType}
        />
      );

    case 'progress':
      return (
        <Progress
          sessions={sessionsToArchive}
          onComplete={handleArchiveComplete}
        />
      );

    case 'summary':
      return (
        <Summary
          results={archiveResults}
          onRestart={handleRestart}
        />
      );

    default:
      return <ProjectSelect onSelect={handleProjectSelected} />;
  }
}
