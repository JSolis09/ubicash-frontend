import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Customer } from '../../providers/customer/customer';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { RegisterUserPage } from '../register-user/register-user';

/**
* Generated class for the LoginPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

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

}
