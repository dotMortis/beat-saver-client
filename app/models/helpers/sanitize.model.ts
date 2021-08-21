class Sanitize {
    private illegalRe = /[\/\?<>\\:\*\|"]/g;
    private controlRe = /[\x00-\x1f\x80-\x9f]/g;
    private reservedRe = /^\.+$/;
    private windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    private windowsTrailingRe = /[\. ]+$/;

    private _sanitize(input: string, replacement: string) {
        if (typeof input !== 'string') {
            throw new Error('Input must be string');
        }
        var sanitized = input
            .replace(this.illegalRe, replacement)
            .replace(this.controlRe, replacement)
            .replace(this.reservedRe, replacement)
            .replace(this.windowsReservedRe, replacement)
            .replace(this.windowsTrailingRe, replacement);
        return sanitized;
    }

    public sanitize(input: string, options?: { replacement: string }) {
        var replacement = (options && options.replacement) || '';
        var output = this._sanitize(input, replacement);
        if (replacement === '') {
            return output;
        }
        return this._sanitize(output, '');
    }
}

const _sanitize = new Sanitize();
export const sanitize = (input: string, options?: { replacement: string }) =>
    _sanitize.sanitize(input, options);
