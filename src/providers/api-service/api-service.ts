import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { settings } from '../../environments/environment';

/*
Generated class for the ApiServiceProvider provider.

See https://angular.io/guide/dependency-injection for more info on providers
and Angular DI.
*/
@Injectable()
export class ApiServiceProvider {
    private host: string = settings.host;

    constructor(public http: Http) {
        console.log('Hello ApiServiceProvider Provider');
    }

    public test(): void {
        this.get('')
            .subscribe((response) => {
                console.log(`API successful with data => ${JSON.stringify(response)}`);
            }, (error) => {
                console.error(error);
            });
    }

    public get(api: string): Observable<any> {
        const host: string = `${this.host}${api}`;
        return this.http.get(host);
    }

    public post(api: string, data: any): Observable<any> {
        const host: string = `${this.host}/api/${api}`;
        return this.http.post(host, data);
    }
}
