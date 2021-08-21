import { BrowserWindow } from 'electron';
import { TSend } from '../../../src/models/electron/send.channels';

export const webContentsSend = <SEND_TYPE extends TSend<any, any> = never>(
    window: BrowserWindow,
    channel: SEND_TYPE['channel'],
    args: SEND_TYPE['args']
): void => window.webContents.send(channel, args);
