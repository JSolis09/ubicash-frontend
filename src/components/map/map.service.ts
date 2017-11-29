import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export class MapService {
    private parentSubject = new Subject();

    constructor() { }

}
