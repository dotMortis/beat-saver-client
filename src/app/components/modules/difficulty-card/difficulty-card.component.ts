import { Component, Input, OnInit } from '@angular/core';
import { ApiHelpers } from '../../../../models/api.helpers';
import { ECharacteristic, TMapDifficulty } from '../../../../models/api.models';

@Component({
    selector: 'app-difficulty-card',
    templateUrl: './difficulty-card.component.html',
    styleUrls: ['./difficulty-card.component.scss']
})
export class DifficultyCardComponent implements OnInit {
    @Input() groupedDifs?: Map<ECharacteristic, TMapDifficulty[]>;
    @Input() stylClass?: string;

    private _characteristics: { label: ECharacteristic; icon: string; diffs: TMapDifficulty[] }[];

    get characteristics(): { label: ECharacteristic; icon: string; diffs: TMapDifficulty[] }[] {
        return this._characteristics;
    }

    private _selectedCharacteristic?: {
        label: ECharacteristic;
        icon: string;
        diffs: TMapDifficulty[];
    };
    get selectedCharacteristic():
        | {
              label: ECharacteristic;
              icon: string;
              diffs: TMapDifficulty[];
          }
        | undefined {
        return this._selectedCharacteristic;
    }
    set selectedCharacteristic(
        value:
            | {
                  label: ECharacteristic;
                  icon: string;
                  diffs: TMapDifficulty[];
              }
            | undefined
    ) {
        if (value?.label !== this._selectedCharacteristic?.label) {
            this._selectedCharacteristic = value;
        }
    }
    constructor() {
        this._characteristics = new Array<{
            label: ECharacteristic;
            icon: string;
            diffs: TMapDifficulty[];
        }>();
    }

    ngOnInit(): void {
        for (const [characteristic, diffs] of this.groupedDifs || []) {
            const dropdownItem = {
                label: characteristic,
                icon: this.getIconUrl(characteristic),
                diffs
            };
            this._characteristics.push(dropdownItem);
            if (characteristic === ECharacteristic.Standard)
                this.selectedCharacteristic = dropdownItem;
        }
        if (!this.selectedCharacteristic) this.selectedCharacteristic = this._characteristics[0];
    }

    getIconUrl(characteristic: ECharacteristic): string {
        return ApiHelpers.getCharacteristicIcon(characteristic) || '';
    }

    getLabel(tMapDifficulty: TMapDifficulty): string {
        return ApiHelpers.getDifficultyLabel(tMapDifficulty?.difficulty);
    }
}
