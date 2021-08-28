import { BrowserWindow, ipcMain } from 'electron';
import { TInvoke } from '../../../src/models/electron/invoke.channels';
import { TSend } from '../../../src/models/electron/send.channels';

export class IpcHelerps {
    static ipcMainHandle<INVOKE_TYPE extends TInvoke<string, any, any> = never>(
        channel: INVOKE_TYPE['channel'],
        cb: (
            event: Electron.IpcMainInvokeEvent,
            args: INVOKE_TYPE['args']
        ) => Promise<INVOKE_TYPE['retrunValue']>
    ): INVOKE_TYPE['channel'] {
        ipcMain.handle(channel, cb);
        //appLogger()?.debug(`[Registered ipcMainHandle]:\t${channel}`);
        return channel;
    }

    static ipcMainOn<SEND_TYPE extends TSend<string, any> = never>(
        channel: SEND_TYPE['channel'],
        cb: (event: Electron.IpcMainInvokeEvent, args: SEND_TYPE['args']) => void
    ): SEND_TYPE['channel'] {
        ipcMain.on(channel, cb);
        //appLogger()?.debug(`[Registered ipcMainSend]:\t${channel}`);
        return channel;
    }

    static webContentsSend<SEND_TYPE extends TSend<any, any> = never>(
        window: BrowserWindow,
        channel: SEND_TYPE['channel'],
        args: SEND_TYPE['args']
    ): void {
        window.webContents.send(channel, args);
    }
}
