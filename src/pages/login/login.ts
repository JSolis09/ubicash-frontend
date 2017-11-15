import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Customer, FacebookCustomer } from '../../providers/customer/customer';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { RegisterUserPage } from '../register-user/register-user';

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
                private apiService: ApiServiceProvider,
                private fb: Facebook,
                private loadingCtrl: LoadingController,
                public navCtrl: NavController,
                public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }

    public login(): void {
        const loading = this.loadingCtrl.create({
            content: 'iniciando sesión...'
        });
        loading.present();
        this.apiService
            .post('Users/login', {
                email: this.customer.email,
                password: this.customer.password
            })
            .subscribe((response) => {
                loading.dismiss();
                const alert = this.alertCtrl.create({
                    title: 'Inició sesión correctamente',
                    buttons: ['Cerrar']
                });
                alert.present();
            }, (response) => {
                loading.dismiss();
                const error = response.error;
                let message: string;
                if (error && error.code === 'LOGIN_FAILED'){
                    message = 'Usuario o contraseña incorrectos';
                } else {
                    message = 'Ocurrió un error al iniciar sesión, Intentelo más tarde';
                }
                const alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: message,
                    buttons: ['Cerrar']
                });
                alert.present();
            });
    }

    goRegister(): void {
        this.navCtrl.push(RegisterUserPage);
    }

    fbLogin(): void {
        const loading = this.loadingCtrl.create({
            content: 'iniciando sesión...'
        });
        loading.present();
        const alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Ocurrió un error al conectarse con Facebook',
            buttons: ['Cerrar']
        });
        this.fb
            .login(['public_profile', 'user_friends', 'email'])
            .then((res: FacebookLoginResponse) => {
                this.fb
                    .api('me?fields=id,email,name', [])
                    .then((profile) => {
                        const data: FacebookCustomer = {
                            email: profile['email'],
                            expires: res.authResponse.expiresIn,
                            fbUserId: res.authResponse.userID,
                            token: res.authResponse.accessToken
                        };
                        this.apiService
                            .post('FacebookAccessTokens/login', data)
                            .subscribe((response) => {
                                loading.dismiss();
                                const alert = this.alertCtrl.create({
                                    title: 'Inició sesión correctamente',
                                    subTitle: `Bienvenido, ${ profile['name'] }`,
                                    buttons: ['Cerrar']
                                });
                                alert.present();
                            }, (errorResponse) => {
                                loading.dismiss();
                                const error = errorResponse.error;
                                let message;
                                if (error && error.code === 'EMAIL_EXISTS'){
                                    message = 'El email ya se encuentra registrado';
                                } else {
                                    message = 'Ocurrió un error al iniciar sesión, Intentelo más tarde';
                                }
                                const alert = this.alertCtrl.create({
                                    title: 'Error',
                                    subTitle: message,
                                    buttons: ['Cerrar']
                                });
                                alert.present();
                            });
                    })
                    .catch((error) => {
                        alert.present();
                        loading.dismiss();
                    });
            })
            .catch(e => {
                alert.present();
                loading.dismiss();
            });
    }


}
