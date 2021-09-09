import { app, Rectangle, screen } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from './winston.logger';

export class WindowStorage {
    public readonly path: string;
    public readonly filename: string;
    public get fullPath(): string {
        return join(this.path, this.filename);
    }
    public data?: TWindowStorageData;

    constructor() {
        this.path = join(app.getPath('appData'), app.getName());
        this.filename = 'init.json';
    }

    public init(): TWindowStorageData {
        return (this.data = this._loadData());
    }

    public saveCurrentState(window: Electron.BrowserWindow): void {
        const bounds = window.getBounds();
        const { id } = screen.getDisplayNearestPoint(bounds);
        const data: TWindowStorageData = {
            bounds,
            id
        };
        try {
            writeFileSync(this.fullPath, JSON.stringify(data));
        } catch (error: any) {
            logger.error(error);
        }
    }

    private _loadData(): TWindowStorageData {
        try {
            const fileBuffer = readFileSync(this.fullPath);
            const data: TWindowStorageData = JSON.parse(fileBuffer.toString());
            return this._validateData(data);
        } catch {
            return this._getDefaultSettings();
        }
    }

    private _validateData(data: TWindowStorageData): TWindowStorageData {
        const { workArea, id } = screen.getDisplayNearestPoint(data.bounds);
        if (id !== data.id) return this._getDefaultSettings();
        else {
            if (
                !(data.bounds.x > workArea.x && data.bounds.x < workArea.width) ||
                !(data.bounds.y > workArea.y && data.bounds.y < workArea.height)
            ) {
                data.bounds = this._calulateBounds(workArea);
            }
            return data;
        }
    }

    private _getDefaultSettings(): TWindowStorageData {
        const { workArea, id } = screen.getPrimaryDisplay();
        return {
            bounds: this._calulateBounds(workArea),
            id
        };
    }

    private _calulateBounds(bounds: Rectangle): Rectangle {
        const width = bounds.width * 0.75;
        const height = bounds.height * 0.75;
        const x = bounds.width / 2 - width / 2;
        const y = bounds.height / 2 - height / 2;
        return {
            width,
            height,
            x,
            y
        };
    }
}

export type TWindowStorageData = {
    bounds: Electron.Rectangle;
    id: number;
};
