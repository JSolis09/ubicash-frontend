import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Customer, FacebookCustomer } from '../../providers/customer/customer';
import { CustomerToken } from '../../providers/customer/access-token';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { RegisterUserPage } from '../register-user/register-user';

import { HomePage } from '../home/home';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    public title: string = 'Inicio de sesión';
    public customer: Customer = new Customer();

    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private fb: Facebook,
                private loadingCtrl: LoadingController,
                public navCtrl: NavController,
                public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }

    goHome(): void {
        this.navCtrl.setRoot(HomePage);
    }

    goRegister(): void {
        this.navCtrl.push(RegisterUserPage);
    }

    fbLogin(): void {
        const alert = this.alertCtrl.create({
            title: 'Error',
            message: 'Ocurrió un error al conectarse con Facebook',
            buttons: [
                {
                    text: 'cerrar',
                    role: 'cancel',
                    cssClass: 'one-button'
                }
            ]
        });
        this.fb
            .login(['public_profile', 'user_friends', 'email'])
            .then((res: FacebookLoginResponse) => {
                const loading = this.loadingCtrl.create({
                    content: 'iniciando sesión...'
                });
                loading.present();
                this.fb
                    .api('me?fields=id,email,name', [])
                    .then((profile) => {
                        const data: FacebookCustomer = {
                            email: profile['email'],
                            expires: res.authResponse.expiresIn,
                            fbUserId: res.authResponse.userID,
                            token: res.authResponse.accessToken
                        };
                        this.customerService
                            .loginWithFbAccessToken(data)
                            .subscribe((response) => {
                                console.log(response);
                                loading.dismiss();
                                this.customerService
                                    .setCustomerToken(response);
                                this.customerService
                                    .setCustomer({ id: response.userId } as Customer);
                                this.goHome();
                            }, (errorResponse) => {
                                loading.dismiss();
                                this.fb
                                    .logout()
                                    .then((response)=>{
                                        const error = errorResponse.error;
                                        let message;
                                        if (error && error.code === 'EMAIL_EXISTS'){
                                            message = 'El email ya se encuentra registrado';
                                        }else {
                                            message = 'Ocurrió un error al iniciar sesión, Intentelo más tarde';
                                        }
                                        const alert = this.alertCtrl.create({
                                            title: 'Error',
                                            message: message,
                                            buttons: [
                                                {
                                                    text: 'cerrar',
                                                    role: 'cancel',
                                                    cssClass: 'one-button'
                                                }
                                            ]
                                        });
                                        alert.present();
                                    });
                            });
                    })
                    .catch((error) => {
                        alert.present();
                        loading.dismiss();
                    });
            })
            .catch(() => {

            });
    }

    public login(): void {
        const loading = this.loadingCtrl.create({
            content: 'iniciando sesión...'
        });
        loading.present();
        this.customerService
            .login(this.customer)
            .subscribe((response: CustomerToken) => {
                loading.dismiss();
                this.customerService
                    .setCustomerToken(response);
                this.customerService
                    .setCustomer({ id: response.userId, email: this.customer.email } as Customer);
                this.goHome();
            }, (response) => {
                loading.dismiss();
                const error = response.error;
                let message: string;
                if (error && error.code === 'LOGIN_FAILED'){
                    message = 'Usuario o contraseña incorrectos';
                } else if(error && error.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
                    message = 'El email no ha sido verificado';
                } else {
                    message = 'Ocurrió un error al iniciar sesión, Intentelo más tarde';
                }
                const alert = this.alertCtrl.create({
                    title: 'Error',
                    message: message,
                    buttons: [
                        {
                            text: 'cerrar',
                            role: 'cancel',
                            cssClass: 'one-button'
                        }
                    ]
                });
                alert.present();
            });
    }


}
