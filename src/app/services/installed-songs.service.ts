import { EventEmitter, Injectable } from '@angular/core';
import { ipcRendererInvoke, ipcRendererSend } from '../../models/electron/electron.register';
import {
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../models/electron/invoke.channels';
import { TSendDebug } from '../../models/electron/send.channels';
import { TSongId } from '../../models/played-songs.model';
import { TFileLoaded } from '../../models/types';
import { ElectronService } from './electron.service';
import { NotifyService } from './notify.service';

@Injectable({
    providedIn: 'root'
})
export class InstalledSongsService {
    public installedSongsReloaded: EventEmitter<void>;

    constructor(private _eleService: ElectronService, private _notify: NotifyService) {
        this.installedSongsReloaded = new EventEmitter<void>();
    }

    async songIsInstalled(
        songId: TSongId
    ): Promise<false | { result: boolean | undefined; status: TFileLoaded }> {
        const result = await ipcRendererInvoke<TInvokeIsInstalled>(
            this._eleService,
            'SONG_IS_INSTALLED',
            {
                songId
            }
        );
        this._notify.errorFileHandle(result, 'BS Installation');
        return result;
    }

    async loadInstalledSongs(): Promise<false | { status: TFileLoaded }> {
        ipcRendererSend<TSendDebug>(this._eleService, 'DEBUG', {
            msg: 'loadInstalledSongs'
        });
        const result = await ipcRendererInvoke<TInvokeLoadInstalledSongs>(
            this._eleService,
            'LOAD_INSTALLED_STATS',
            undefined
        );
        this._notify.errorFileHandle(result, 'BS Installation');
        this.installedSongsReloaded.next();
        return result;
    }
}
