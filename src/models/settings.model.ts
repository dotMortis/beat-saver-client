export type TSettings = {
    bsInstallPath: TSetting<string | undefined, 'FODLER', 'EXIST', true, undefined>;
    bsAppDataPath: TSetting<string | undefined, 'FODLER', 'EXIST', true, undefined>;
    playerName: TSetting<string | undefined, 'ANY', 'NONE', true, undefined>;
    expandAllSongCards: TSetting<boolean, 'ANY', 'NONE', true, false>;
    beatSaverPaginated: TSetting<boolean, 'ANY', 'NONE', true, true>;
    localsPaginated: TSetting<boolean, 'ANY', 'NONE', true, true>;
    mapperPaginated: TSetting<boolean, 'ANY', 'NONE', true, true>;
};

export type TSetting<
    T,
    TYPE extends TSettingType,
    CHECK extends TSettingCheck,
    NULLABLE extends boolean,
    DEFAULT extends T
> = {
    value: T;
    type: TYPE extends TSettingType ? TYPE : never;
    check: CHECK extends TSettingCheck ? CHECK : never;
    nullable: NULLABLE extends boolean ? NULLABLE : never;
    default: DEFAULT;
    error?: string;
};

export type TSettingType = 'FILE' | 'FODLER' | 'ANY';
export type TSettingCheck = 'EXIST' | 'CREATE' | 'NONE';
