import { Coordinates } from '@ionic-native/geolocation';

export class LogRequest {
    created?: Date;
    bank_name: string;
    location: string;
    user_email: string;
    branch?: string;
}

export class Log {
    location: Coordinates;
    branch?: Branch;
    bank_name: string;
}

export class Branch {
    address: string;
    detail: string;
}

