import { Component, Input } from '@angular/core';

import { BankDetail } from '../../providers/bank/bank';

@Component({
    selector: 'marker-detail',
    templateUrl: 'marker-detail.html'
})
export class MarkerDetailComponent {
    @Input() bankDetail: BankDetail;

    constructor() { }

}
