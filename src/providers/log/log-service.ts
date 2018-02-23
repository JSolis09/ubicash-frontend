import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

import { ApiServiceProvider } from '../api-service/api-service';
import { Log, LogRequest } from './log';
import { CustomerServiceProvider } from '../customer/customer-service';

@Injectable()
export class LogServiceProvider {
    constructor(private apiService: ApiServiceProvider,
                private customerService: CustomerServiceProvider) { }

    public save(log: Log): void {
        const customerToken = this.customerService.getCustomerToken();
        const customer = this.customerService.getCustomer();
        const headers = new Headers();
        headers.set('Authorization', customerToken.id);
        const logRequest:LogRequest = {
            bank_name: log.bank_name,
            location: log.location ? `${log.location.latitude},${log.location.longitude}`: null,
            user_email: customer.email,
            branch: log.branch ? `${log.branch.address}, ${log.branch.detail} `: null
        };
        this.apiService
            .post('Logs', logRequest, { headers })
            .subscribe((response) => { });
    }

}
