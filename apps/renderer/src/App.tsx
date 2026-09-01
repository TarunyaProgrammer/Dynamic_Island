// apps/renderer/src/App.tsx
import React, { useMemo } from 'react';
import { MainAppView } from './surfaces/MainAppView';
import { TrayPopoverView } from './surfaces/TrayPopoverView';
import { DynamicIslandView } from './surfaces/DynamicIslandView';
import { CommandPaletteView } from './surfaces/CommandPaletteView';

export const App: React.FC = () => {
  const surface = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('surface') || 'main';
  }, []);

  switch (surface) {
    case 'tray':
      return <TrayPopoverView />;
    case 'island':
      return <DynamicIslandView />;
    case 'palette':
      return <CommandPaletteView />;
    case 'main':
    default:
      return <MainAppView />;
  }
};
