import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ECharacteristic, EDifficulty, TMapDifficulty } from '../../../../models/api/api.models';
import { ApiHelpers } from '../../../../models/maps/maps.helpers';
import { TLevelStatsData } from '../../../../models/player/player-data.model';

@Component({
    selector: 'app-difficulty-card',
    templateUrl: './difficulty-card.component.html',
    styleUrls: ['./difficulty-card.component.scss']
})
export class DifficultyCardComponent implements OnInit {
    private _groupedLevelStatsData?: Map<ECharacteristic, TLevelStatsData[]>;
    @Input()
    get groupedLevelStatsData(): Map<ECharacteristic, TLevelStatsData[]> | undefined {
        return this._groupedLevelStatsData;
    }
    set groupedLevelStatsData(val: Map<ECharacteristic, TLevelStatsData[]> | undefined) {
        this._groupedLevelStatsData = val;
    }
    get activeLevelStatsData(): TLevelStatsData[] | undefined {
        return this._activeChar ? this._groupedLevelStatsData?.get(this._activeChar) : undefined;
    }

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
    private _activeChar?: ECharacteristic;
    @Input()
    get selectedDiff(): TMapDifficulty | undefined {
        return this._selectedDiff;
    }
    set selectedDiff(val: TMapDifficulty | undefined) {
        if (this._selectedDiffId !== ApiHelpers.computeDiffId(val)) {
            this._selectedDiff = val;
            this._selectedDiffId = val ? ApiHelpers.computeDiffId(val) : undefined;
            this._activeChar = val?.characteristic;
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

    getPlayerStatsData(diff: EDifficulty): TLevelStatsData | undefined {
        const diffIndex = ApiHelpers.getIndexFromDifficulty(diff);
        return this.activeLevelStatsData?.find(data => data.difficulty === diffIndex);
    }
}
