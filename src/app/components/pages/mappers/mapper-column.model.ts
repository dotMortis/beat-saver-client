import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { TMapperListResult } from '../../../../models/api/api.models';

export type TMapperColumn = {
    rank: number;
    type: 'index' | 'string' | 'number' | 'avatar' | 'date';
    headerIcon?: string | IconProp;
    iconType?: 'pi' | 'fa';
    pipeFormat?: string;
    field: string;
    header: string;
    class?: string;
    headerClass?: string;
    'min-width'?: string;
    'max-width'?: string;
    width?: string;
    default?: string | number;
    transformer?: (val: TMapperListResult) => any;
    resizable: boolean;
};
