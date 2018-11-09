import { Injectable } from '@angular/core';

@Injectable()
export class TranslateProvider {
    constructor() { }

    translate(key: string): string {
        return codes[key] ? codes[key] : key;
    }
}

const codes = {
    'EMAIL_NOT_FOUND': 'El email no existe',
    'Email already exists': 'El email ya existe',
    'User already exists': 'El nombre de usuario ya existe'
};