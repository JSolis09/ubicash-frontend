import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Customer } from '../../providers/customer/customer';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    public customer: Customer;
    constructor(public navCtrl: NavController,
                private customerService: CustomerServiceProvider
    ) {
        this.customer = this.customerService.getCustomer();
    }

}
