import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

import { Customer, FacebookCustomer, PasswordReset } from './customer';
import { CustomerToken } from './access-token';
import { ApiServiceProvider } from '../api-service/api-service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CustomerServiceProvider {
    private customer: Customer;
    private customerToken: CustomerToken;

    constructor(private apiService: ApiServiceProvider) { }

    public clean(): void {
        this.customer = null;
        this.customerToken = null;
    }

    public getCustomer(): Customer {
        return this.customer;
    }

    public setCustomer(customer: Customer): void {
        this.customer = Object.assign(this.customer || { }, customer);
    }

    public getCustomerToken(): CustomerToken {
        return this.customerToken;
    }

    public setCustomerToken(customerToken: CustomerToken): void {
        this.customerToken = Object.assign(this.customerToken || { }, customerToken);
    }

    public create(customer: Customer): Observable<any> {
        return this.apiService
            .post('Customers', customer);
    }

    public login(customer: Customer): Observable<CustomerToken> {
        return this.apiService
            .post('Customers/login', customer)
    }

    public logout(): Promise<any> {
        const customerToken = this.customerToken || { } as CustomerToken;
        const headers = new Headers();
        headers.set('Authorization', customerToken.id);
        return this.apiService
            .post('Customers/logout',{ }, { headers })
            .toPromise()
            .then(() => this.clean);
    }

    public loginWithFbAccessToken(data: FacebookCustomer): Observable<CustomerToken> {
        return this.apiService
            .post('FacebookAccessTokens/login', data);
    }

    public resetPassword(data: PasswordReset): Observable<CustomerToken> {
        return this.apiService
            .post('Customers/reset', data);
    }

    public resetPasswordCode(data: PasswordReset): Observable<CustomerToken> {
        return this.apiService
            .post('Customers/reset-password-code', data);
    }

}
