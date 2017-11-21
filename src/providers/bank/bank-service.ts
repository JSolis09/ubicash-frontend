import { Injectable } from '@angular/core';

import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { Observable } from 'rxjs/Observable';
import { Bank } from './bank';
import { CustomerToken } from '../customer/access-token';

@Injectable()
export class BankServiceProvider {

    constructor(private apiService: ApiServiceProvider,
                private customerService: CustomerServiceProvider) { }

    getAll(): Observable<Bank[]> {
        const customerToken: CustomerToken = this.customerService.getCustomerToken();
        return this.apiService
            .setHeader('X-Access-Token', customerToken.id)
            .get('/api/Banks')
    }

}
