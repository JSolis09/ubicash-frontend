import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { settings } from '../../environments/environment';

export interface Filter {
    limit: number,
    skip: number
}

@Injectable()
export class ApiServiceProvider {
    private host: string = settings.host;
    private headers: Headers = new Headers();

    constructor(public http: Http) {
        console.log('Hello ApiServiceProvider Provider');
    }

    private errorHandler(error: any): Observable<any> {
        let errorResponse;
        if (error && error.json) {
            errorResponse = error.json();
        } else {
            errorResponse = error;
        }
        return Observable.throw(errorResponse || { });
    }

    public setHeader(key: string, value: string): ApiServiceProvider {
        this.headers.delete(key);
        this.headers.set(key, value);
        return this;
    }

    public get(api: string, options?: any): Observable<any> {
        const host: string = `${this.host}${api}`;
        options = options || {};
        return this.http
            .get(host, options)
            .map((response) => response.json())
            .catch((error: Error) => this.errorHandler(error));
    }

    public post(api: string, data: any, options?: any): Observable<any> {
        const host: string = `${this.host}/api/${api}`;
        options = options || {};
        return this.http
            .post(host, data, options)
            .map((response) => response.json())
            .catch((error: Error) => this.errorHandler(error));
    }

    public test(): void {
        this.get('')
            .subscribe((response) => {
                console.log(`API successful with data => ${JSON.stringify(response)}`);
            }, (error) => {
                console.error(error);
            });
    }
}
