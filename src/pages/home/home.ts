import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';

import { Customer } from '../../providers/customer/customer';
import { Bank } from '../../providers/bank/bank';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { BankServiceProvider } from '../../providers/bank/bank-service';
import { ResultPage } from '../result/result';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public customer: Customer;
    public banks: Observable<Bank[]>;
    public bank: string;

    constructor(private navCtrl: NavController,
                private customerService: CustomerServiceProvider,
                private bankService: BankServiceProvider) {
        this.customer = this.customerService.getCustomer();
        this.banks = this.bankService.getAll();
    }

    public changeBank(): void {
        this.navCtrl
            .push(ResultPage, { bank: this.bank });
    }

}
