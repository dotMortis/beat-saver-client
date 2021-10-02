import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TFileLoaded } from '../../../models/electron/file-loaded.model';

@Injectable({
    providedIn: 'root'
})
export class NotifyService {
    constructor(private _messageService: MessageService) {}

    error(v: { title: string; error: Error | string }): void {
        return this._messageService.add({
            severity: 'error',
            summary: v.title,
            detail: v.error instanceof Error ? v.error.message : JSON.stringify(v.error)
        });
    }

    errorFileHandle(fileResult: { status: TFileLoaded } | false, pathName: string) {
        if (
            fileResult !== false &&
            (fileResult.status === 'INVALID_PATH' || fileResult.status instanceof Error)
        ) {
            this.error({
                title: fileResult.status instanceof Error ? fileResult.status.name : 'Invalid Path',
                error:
                    fileResult.status instanceof Error
                        ? fileResult.status
                        : `Invalid ${pathName} path`
            });
        }
    }

    warning(v: { title: string; message: string }): void {
        return this._messageService.add({
            severity: 'warning',
            summary: v.title,
            detail: v.message
        });
    }

    success(v: { title: string; message: string }): void {
        return this._messageService.add({
            severity: 'success',
            summary: v.title,
            detail: v.message
        });
    }
}
