// apps/main/shortcuts/ShortcutManager.ts
import { globalShortcut } from '@electron-bridge';
import { PaletteWindowController } from '../windows/PaletteWindow';

export class ShortcutManager {
  private currentShortcut: string | null = null;

  constructor(
    private paletteController: PaletteWindowController,
    private preloadPath: string,
    private rendererUrl?: string
  ) {}

  register(shortcut = 'CommandOrControl+Shift+B'): boolean {
    if (this.currentShortcut) {
      globalShortcut.unregister(this.currentShortcut);
    }

    try {
      const success = globalShortcut.register(shortcut, () => {
        this.paletteController.toggle(this.preloadPath, this.rendererUrl);
      });

      if (success) {
        this.currentShortcut = shortcut;
      }
      return success;
    } catch (err) {
      console.error(`Failed to register global shortcut ${shortcut}:`, err);
      return false;
    }
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll();
    this.currentShortcut = null;
  }
}
