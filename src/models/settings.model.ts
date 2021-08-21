export type TSettings = {
    bsInstallPath: TSetting<string | undefined, 'FODLER', 'EXIST', true>;
    bsAppDataPath: TSetting<string | undefined, 'FODLER', 'EXIST', true>;
    playerName: TSetting<string | undefined, 'ANY', 'NONE', true>;
};

export type TSetting<
    T,
    TYPE extends TSettingType,
    CHECK extends TSettingCheck,
    NULLABLE extends boolean
> = {
    value: T;
    type: TYPE extends TSettingType ? TYPE : never;
    check: CHECK extends TSettingCheck ? CHECK : never;
    nullable: NULLABLE extends boolean ? NULLABLE : never;
    error?: string;
};

export type TSettingType = 'FILE' | 'FODLER' | 'ANY';
export type TSettingCheck = 'EXIST' | 'CREATE' | 'NONE';
