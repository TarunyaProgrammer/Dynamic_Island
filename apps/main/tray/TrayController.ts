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
    // 16x16 crisp monochrome vector template of the faceted Beacon "B" glyph
    const svg = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 2.2C3 1.8 3.3 1.5 3.7 1.5H8.2C10.7 1.5 12.5 3.1 12.5 5.2C12.5 6.4 11.8 7.4 10.7 8C12.1 8.6 13 9.7 13 11.1C13 13.3 11 14.5 8.4 14.5H3.7C3.3 14.5 3 14.2 3 13.8V2.2Z" fill="black"/>
        <path d="M5 3.4V7.2H8C9.2 7.2 10.2 6.4 10.2 5.3C10.2 4.2 9.2 3.4 8 3.4H5ZM5 8.6V12.6H8.3C9.7 12.6 10.7 11.8 10.7 10.6C10.7 9.4 9.7 8.6 8.3 8.6H5Z" fill="white"/>
      </svg>
    `;
    const image = nativeImage.createFromBuffer(Buffer.from(svg), { scaleFactor: 2.0 });
    image.setTemplateImage(true); // Automatically adapts to macOS light/dark menu bar
    return image;
  }
}
