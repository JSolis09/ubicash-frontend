import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';

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
        const params = new URLSearchParams();
        params.set('access_token', customerToken.id);
        return this.apiService
            .get('/api/Banks', { search: params });
    }

}
