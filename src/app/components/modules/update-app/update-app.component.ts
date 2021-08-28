import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UnsubscribeComponent } from '../../../../models/unsubscribe.model';
import { UpdateService } from '../../../services/null.provided/update.service';

@Component({
    selector: 'app-update-app',
    templateUrl: './update-app.component.html',
    styleUrls: ['./update-app.component.scss'],
    providers: [UpdateService]
})
export class UpdateAppComponent extends UnsubscribeComponent implements OnInit {
    private _visible: boolean;
    private _nextVisible: boolean;
    get visible(): boolean {
        return this._visible;
    }
    set visible(val: boolean) {
        if (val !== this._visible) {
            if (val) this._visible = this._nextVisible = val;
            else if (this._nextVisible !== val) {
                this._nextVisible = val;
                setTimeout(() => {
                    this._visible = val;
                    this._detectionRef.detectChanges();
                }, 2000);
            }
        }
    }

    constructor(public updateServce: UpdateService, private _detectionRef: ChangeDetectorRef) {
        super();
        this._nextVisible = this._visible = false;
    }

    ngOnInit(): void {
        this.addSub(
            this.updateServce.onChange.pipe(
                tap(status => {
                    if (status === 'NO_UPDATE') {
                        this.visible = false;
                    } else {
                        this.visible = true;
                    }
                    this._detectionRef.detectChanges();
                })
            )
        );
    }
}
