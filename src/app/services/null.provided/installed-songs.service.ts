import { EventEmitter, Injectable } from '@angular/core';
import {
    TInvokeIsInstalled,
    TInvokeLoadInstalledSongs
} from '../../../models/electron/invoke.channels';
import { TSendDebug } from '../../../models/electron/send.channels';
import { TSongId } from '../../../models/played-songs.model';
import { TFileLoaded } from '../../../models/types';
import { ElectronService } from '../root.provided/electron.service';
import { NotifyService } from '../root.provided/notify.service';

@Injectable({
    providedIn: null
})
export class InstalledSongsService {
    public installedSongsReloaded: EventEmitter<void>;

    constructor(private _eleService: ElectronService, private _notify: NotifyService) {
        this.installedSongsReloaded = new EventEmitter<void>();
    }

    async songIsInstalled(
        songId: TSongId
    ): Promise<false | { result: boolean | undefined; status: TFileLoaded }> {
        const result = await this._eleService.invoke<TInvokeIsInstalled>('SONG_IS_INSTALLED', {
            songId
        });
        this._notify.errorFileHandle(result, 'BS Installation');
        return result;
    }

    async loadInstalledSongs(): Promise<false | { status: TFileLoaded }> {
        this._eleService.send<TSendDebug>('DEBUG', {
            msg: 'loadInstalledSongs'
        });
        const result = await this._eleService.invoke<TInvokeLoadInstalledSongs>(
            'LOAD_INSTALLED_STATS',
            undefined
        );
        this._notify.errorFileHandle(result, 'BS Installation');
        this.installedSongsReloaded.next();
        return result;
    }
}
