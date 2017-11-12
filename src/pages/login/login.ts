import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { Customer } from '../../providers/customer/customer';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

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
        this.apiService
            .post('Users/login', {
                email: this.customer.email,
                password: this.customer.password
            })
            .subscribe(() => {
                const alert = this.alertCtrl.create({
                    title: 'Inició sesión correctamente',
                    buttons: ['Cerrar']
                });
                alert.present();
            }, (error) => {
                const alert = this.alertCtrl.create({
                    title: 'Error inicio de sesión',
                    subTitle: `${JSON.stringify(error)}`,
                    buttons: ['Cerrar']
                });
                alert.present();
            }, () => {
                loading.dismiss();
            });
    }

    goRegister(): void {
        
    }

}
