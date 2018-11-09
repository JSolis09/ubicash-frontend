export const CUSTOMER_NAME = 'customer';
export const CUSTOMER_TOKEN_NAME = 'customerToken';

export class Customer {
    public id?: string;
    public email: string = '';
    public password: string = '';
    public username?: string;
    public name?: string;
    public imageUrl?: string;
}

export class FacebookCustomer {
    public email: string = '';
    public fbUserId: string = '';
    public expires: number;
    public token: string = '';
}

export class PasswordReset {
    public email: string = '';
    public password?: string = '';
    public code?: string;
}
