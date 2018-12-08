import { Injectable } from '@angular/core';
import { Headers, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';

import { Customer, FacebookCustomer, PasswordReset, CUSTOMER_NAME, CUSTOMER_TOKEN_NAME } from './customer';
import { CustomerToken } from './access-token';
import { ApiServiceProvider } from '../api-service/api-service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CustomerServiceProvider {
    private customer: Customer;
    private customerToken: CustomerToken;
    public customerSubject: Subject<Customer> = new Subject<Customer>();

    constructor(private apiService: ApiServiceProvider,
                private storage: Storage) { }

    public clean(): Promise<void> {
        this.customer = null;
        this.customerToken = null;
        return this.storage
            .clear()
            .then(()=> { return; });
    }

    public getCustomer(): Customer {
        return this.customer;
    }

    public getCustomerById(userId: string, accessToken: string): Observable<Customer> {
        const params = new URLSearchParams();
        params.set('access_token', accessToken);
        return this.apiService
            .get(`Customers/${ userId }`, { search: params });
    }

    public setCustomer(customer: Customer): void {
        this.customer = Object.assign(this.customer || { }, customer);
        this.storage.set(CUSTOMER_NAME, this.customer);
        this.customerSubject.next(this.customer);
    }

    public getCustomerToken(): CustomerToken {
        return this.customerToken;
    }

    public setCustomerToken(customerToken: CustomerToken): void {
        this.customerToken = Object.assign(this.customerToken || { }, customerToken);
        this.storage.set(CUSTOMER_TOKEN_NAME, this.customerToken);
    }

    public create(customer: Customer): Observable<any> {
        return this.apiService
            .post('Customers', customer);
    }

    public login(customer: Customer): Observable<CustomerToken> {
        return this.apiService
            .post('Customers/login', customer)
    }

    public logout(): Observable<any> {
        const customerToken = this.customerToken || { } as CustomerToken;
        const headers = new Headers();
        headers.set('Authorization', customerToken.id);
        return this.apiService
            .post('Customers/logout',{ }, { headers })
            .map((response) => {
                return this.clean();
            })
            .catch((e) => {
                return this.clean();
            });
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
