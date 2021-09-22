import { Helpers } from '../angular/helpers.model';

export interface ILocalMapsFilter {
    q?: string;
}
export class LocalMapsFilter implements ILocalMapsFilter {
    q?: string;

    constructor(options: ILocalMapsFilter) {
        Helpers.assignNotNull<LocalMapsFilter>(this, 'q', options);
    }

    set<T extends LocalMapsFilter, KEY extends keyof T>(key: KEY, value: T[KEY]) {
        Object.assign(this, { [key]: value });
    }
}
