import { ElectronService } from '../../app/services/root.provided/electron.service';
import { TInvoke } from './invoke.channels';
import { TSend } from './send.channels';

export const ipcRendererInvoke = async <INVOKE_TYPE extends TInvoke<any, any, any> = never>(
    service: ElectronService,
    channel: INVOKE_TYPE['channel'],
    args: INVOKE_TYPE['args']
): Promise<INVOKE_TYPE['retrunValue'] | false> =>
    service.ipcRenderer ? service.ipcRenderer.invoke(channel, args) : false;

export const ipcRendererSend = <SEND_TYPE extends TSend<any, any> = never>(
    service: ElectronService,
    channel: SEND_TYPE['channel'],
    args: SEND_TYPE['args']
): boolean => {
    if (service.ipcRenderer) {
        service.ipcRenderer.send(channel, args);
        return true;
    } else return false;
};

export const ipcRendererOn = <SEND_TYPE extends TSend<any, any> = never>(
    service: ElectronService,
    channel: SEND_TYPE['channel'],
    cb: (event: Electron.IpcRendererEvent, args: SEND_TYPE['args']) => void
): boolean => {
    if (service.ipcRenderer) {
        service.ipcRenderer.on(channel, cb);
        return true;
    } else return false;
};
