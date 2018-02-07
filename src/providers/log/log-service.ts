import { Injectable } from '@angular/core';

import { ApiServiceProvider } from '../api-service/api-service';
import { Log } from './log';

@Injectable()
export class LogServiceProvider {
    constructor(private apiService: ApiServiceProvider) { }

    public save(log: Log): void {
        this.apiService
            .post('Logs', log)
            .subscribe((response) => { });
    }

}
