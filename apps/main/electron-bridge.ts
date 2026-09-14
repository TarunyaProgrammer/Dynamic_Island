import { createRequire } from 'module';

// Electron 34 can crash when its CommonJS package is consumed as a static ESM
// external. Keep the bridge in one place; Vite aliases main-process imports here.
const electron = createRequire(import.meta.url)('electron') as typeof import('electron');
export const { app, session, powerMonitor, nativeImage, systemPreferences, BrowserWindow, Notification, safeStorage, globalShortcut, screen, Menu, Tray, dialog, ipcMain, clipboard, shell } = electron;
export type { Rectangle } from 'electron';
export type BrowserWindow = import('electron').BrowserWindow;
export type Tray = import('electron').Tray;
export type WebContents = import('electron').WebContents;
export type Display = import('electron').Display;
