export type TOpenId =
    | { type: 'map'; id: string }
    | { type: 'mapper'; id: number }
    | { type: 'custom'; id: string };
export type TOpenIdType = 'map' | 'mapper' | 'custom';
