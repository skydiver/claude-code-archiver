import { useState, useCallback } from 'react';
import {
  ArchiveTypeSelect,
  ConfirmArchive,
  Progress,
  ProjectSelect,
  SessionPreview,
  Summary,
} from './components/screens';
import type { ArchiveResult } from './lib/archive';
import type { ArchiveType, Project, Screen, Session } from './types';

export function App() {
  const [screen, setScreen] = useState<Screen>('project-select');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [archiveType, setArchiveType] = useState<ArchiveType>('unnamed');
  const [sessionsToArchive, setSessionsToArchive] = useState<Session[]>([]);
  const [archiveResults, setArchiveResults] = useState<ArchiveResult[]>([]);

  const handleProjectSelected = useCallback((project: Project) => {
    setSelectedProject(project);
    setScreen('archive-type');
  }, []);

  const handleArchiveTypeSelected = useCallback((type: ArchiveType) => {
    setArchiveType(type);
    setScreen('session-preview');
  }, []);

  const handleSessionsSelected = useCallback((sessions: Session[]) => {
    setSessionsToArchive(sessions);
    setScreen('confirm-archive');
  }, []);

  const handleArchiveConfirmed = useCallback(() => {
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

  const handleBackToSessionPreview = useCallback(() => {
    setScreen('session-preview');
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

    case 'session-preview':
      if (!selectedProject) return <ProjectSelect onSelect={handleProjectSelected} />;
      return (
        <SessionPreview
          project={selectedProject}
          archiveType={archiveType}
          onConfirm={handleSessionsSelected}
          onBack={handleBackToArchiveType}
        />
      );

    case 'confirm-archive':
      return (
        <ConfirmArchive
          sessions={sessionsToArchive}
          onConfirm={handleArchiveConfirmed}
          onBack={handleBackToSessionPreview}
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
