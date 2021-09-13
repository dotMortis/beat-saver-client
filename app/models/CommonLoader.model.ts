import { BrowserWindow } from 'electron';
import EventEmitter from 'events';
import { MainWindow } from './main.window';

export abstract class CommonLoader extends EventEmitter {
    mainWindow!: MainWindow;

    get browserWindow(): BrowserWindow {
        if (!this.mainWindow.window) throw new Error('Browser window undefined');
        return this.mainWindow.window;
    }

    init(window: MainWindow, ...args: any[]) {
        this.mainWindow = window;
    }
}
