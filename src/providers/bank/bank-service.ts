import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Coordinates } from '@ionic-native/geolocation';

import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { Observable } from 'rxjs/Observable';
import { Bank, BankDetail } from './bank';
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
            .get('Banks', { search: params });
    }

    getBankDetails(bankId: string, myLocation: Coordinates): Observable<BankDetail[]> {
        const customerToken: CustomerToken = this.customerService.getCustomerToken();
        const params = new URLSearchParams();
        params.set('lat', myLocation.latitude.toString());
        params.set('lng', myLocation.longitude.toString());
        params.set('access_token', customerToken.id);
        return this.apiService
            .get(`BankDetails/${bankId}/bank-detail-list`, { search: params });
    }

    getBankById(banks: Bank[], bankId: string): Bank {
        banks = banks || [];
        return banks.filter((bank) => bank.id === bankId)[0];
    }

}
