// apps/main/tray/TrayController.ts
import { Menu, Tray, nativeImage } from 'electron';
import { TrayPopoverController } from '../windows/TrayPopoverWindow';
import { MainWindowController } from '../windows/MainWindow';
import { GoalService } from '@core/services/goal-service';

export class TrayController {
  private tray: Tray | null = null;

  constructor(
    private popoverController: TrayPopoverController,
    private mainWindowController: MainWindowController,
    private goalService: GoalService,
    private preloadPath: string,
    private rendererUrl?: string
  ) {}

  initialize(): Tray {
    // Generate a clean 16x16 native icon for the status bar
    const icon = this.createDefaultIcon();
    this.tray = new Tray(icon);
    this.tray.setToolTip('Beacon — Goal Operating Layer');

    this.updateTitle();

    this.tray.on('click', () => {
      const bounds = this.tray?.getBounds();
      if (bounds) {
        this.popoverController.toggle(bounds, this.preloadPath, this.rendererUrl);
      }
    });

    this.tray.on('right-click', () => {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Open Beacon',
          click: () => this.mainWindowController.createOrShow(this.preloadPath, this.rendererUrl),
        },
        { type: 'separator' },
        {
          label: 'Quit Beacon',
          role: 'quit',
        },
      ]);
      this.tray?.popUpContextMenu(contextMenu);
    });

    // Subscribe to goal service updates
    this.goalService.subscribe(() => {
      this.updateTitle();
    });

    return this.tray;
  }

  updateTitle(): void {
    if (!this.tray) return;
    const stats = this.goalService.getStats();
    if (stats.activeGoals === 0) {
      this.tray.setTitle(' Beacon');
    } else {
      const percent = Math.round(stats.overallProgressFraction * 100);
      this.tray.setTitle(` ${percent}%`);
    }
  }

  private createDefaultIcon(): Electron.NativeImage {
    // 16x16 minimalist monochrome macOS status bar icon (circle with center dot)
    const svg = `
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" stroke="black" stroke-width="1.75" fill="none"/>
        <circle cx="8" cy="8" r="2.25" fill="black"/>
      </svg>
    `;
    const image = nativeImage.createFromBuffer(Buffer.from(svg), { scaleFactor: 2.0 });
    image.setTemplateImage(true); // Automatically adapts to macOS light/dark menu bar
    return image;
  }
}
