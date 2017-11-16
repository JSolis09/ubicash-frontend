export const CUSTOMER_NAME = 'customer';

export class Customer {
    public id?: string;
    public email: string = '';
    public password: string = '';
    public username?: string;
}

export class FacebookCustomer {
    public email: string = '';
    public fbUserId: string = '';
    public expires: number;
    public token: string = '';
}
