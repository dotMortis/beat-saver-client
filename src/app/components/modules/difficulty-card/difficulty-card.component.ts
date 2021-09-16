import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ECharacteristic, TMapDifficulty } from '../../../../models/api/api.models';
import { ApiHelpers } from '../../../../models/maps/maps.helpers';

@Component({
    selector: 'app-difficulty-card',
    templateUrl: './difficulty-card.component.html',
    styleUrls: ['./difficulty-card.component.scss']
})
export class DifficultyCardComponent implements OnInit {
    @Input() fontSize: string;
    private _groupedDifs?: Map<ECharacteristic, TMapDifficulty[]>;
    @Input()
    get groupedDifs(): Map<ECharacteristic, TMapDifficulty[]> | undefined {
        return this._groupedDifs;
    }
    set groupedDifs(val: Map<ECharacteristic, TMapDifficulty[]> | undefined) {
        this._groupedDifs = val;
    }
    @Input() selectable: boolean;

    private _selectedDiffId?: string;
    private _selectedDiff?: TMapDifficulty;
    @Input()
    get selectedDiff(): TMapDifficulty | undefined {
        return this._selectedDiff;
    }
    set selectedDiff(val: TMapDifficulty | undefined) {
        if (this._selectedDiffId !== ApiHelpers.computeDiffId(val)) {
            this._selectedDiff = val;
            this._selectedDiffId = val ? ApiHelpers.computeDiffId(val) : undefined;
            this.selectedDiffChange.next(this._selectedDiff);
        }
    }
    @Output() selectedDiffChange: EventEmitter<TMapDifficulty>;

    public isSelected(diff: TMapDifficulty): boolean {
        return this._selectedDiffId === ApiHelpers.computeDiffId(diff);
    }

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
            this.selectedDiff = value?.diffs[0];
        }
    }

    constructor() {
        this.selectable = false;
        this.fontSize = '12px';
        this.selectedDiffChange = new EventEmitter<TMapDifficulty>();
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
        if (!this.selectedCharacteristic) {
            this.selectedCharacteristic = this._characteristics[0];
        }
    }

    onDiffSelect(diff: TMapDifficulty): void {
        this.selectedDiff = diff;
    }

    getIconUrl(characteristic: ECharacteristic): string {
        return ApiHelpers.getCharacteristicIcon(characteristic) || '';
    }

    getLabel(tMapDifficulty: TMapDifficulty): string {
        return ApiHelpers.getDifficultyLabel(tMapDifficulty?.difficulty);
    }
}
