import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Coordinates } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

import { Customer } from '../../providers/customer/customer';
import { Bank } from '../../providers/bank/bank';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { LogServiceProvider } from '../../providers/log/log-service';
import { BankServiceProvider } from '../../providers/bank/bank-service';
import { ResultPage } from '../result/result';
import { UtilProvider } from '../../providers/util/util';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private bankList: Bank[];
    private myLocation: Coordinates;
    public bank: string;
    public banks: Observable<Bank[]>;
    public customer: Customer;

    constructor(private navCtrl: NavController,
                private customerService: CustomerServiceProvider,
                private logService: LogServiceProvider,
                private utilProvider: UtilProvider,
                private bankService: BankServiceProvider) {
        this.customer = this.customerService.getCustomer();
        this.banks = this.bankService
            .getAll()
            .map((banks) => this.bankList = banks.splice(0) );
        this.utilProvider
            .getLocation()
            .then((coords) => {
                this.myLocation = coords;
            });
    }

    public changeBank(): void {
        const bank: Bank = this.bankService.getBankById(this.bankList, this.bank);
        this.logService
            .save({
                bank_name: bank.name,
                location: this.myLocation
            });
        this.navCtrl
            .push(ResultPage, { bank: bank });
    }

}
