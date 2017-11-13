import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Customer } from '../../providers/customer/customer';
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
                console.log(response);
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
        this.fb.login(['public_profile', 'user_friends', 'email'])
        .then((res: FacebookLoginResponse) => {
            this.fb.api('me?fields=id,email,name', [])
                .then((profile) => {
                    const userData = {
                        email: profile['email'],
                        first_name: profile['first_name'],
                        username: profile['name']
                    };
                    const alert = this.alertCtrl.create({
                        title: 'Inició sesión correctamente',
                        subTitle: `${JSON.stringify({
                            fbResponse: res.authResponse,
                            userData: userData
                        })}`,
                        buttons: ['Cerrar']
                    });
                    alert.present();
                });
        })
        .catch(e => console.log('Error logging into Facebook', e));
    }

}
