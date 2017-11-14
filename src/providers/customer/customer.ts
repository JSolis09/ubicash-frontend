export class Customer {
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
