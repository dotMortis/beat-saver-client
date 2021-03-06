import { BrowserWindow } from 'electron';
import { resolve } from 'path';

export class SplashWindow {
    private _window: BrowserWindow;

    constructor() {
        this._window = new BrowserWindow({
            width: 400,
            height: 226,
            center: true,
            resizable: false,
            transparent: true,
            frame: false,
            alwaysOnTop: true
        });
        this._window.loadFile(resolve(__dirname, '..', 'html', 'splash.html'));
    }

    close(): void {
        this._window?.destroy();
    }
}
