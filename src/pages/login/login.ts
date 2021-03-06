import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, MenuController } from 'ionic-angular';

import { Customer } from '../../providers/customer/customer';
import { CustomerToken } from '../../providers/customer/access-token';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { RegisterUserPage } from '../register-user/register-user';

import { HomePage } from '../home/home';

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
                private loadingCtrl: LoadingController,
                private menuCtrl: MenuController,
                public navCtrl: NavController,
                public navParams: NavParams) {
        this.menuCtrl.swipeEnable(false);
    }

    goHome(): void {
        this.navCtrl.setRoot(HomePage);
    }

    goForgotPassword(): void {
        this.navCtrl.push(ForgotPasswordPage);
    }

    goRegister(): void {
        this.navCtrl.push(RegisterUserPage);
    }

    public login(): void {
        const loading = this.loadingCtrl.create({
            content: 'iniciando sesión...'
        });
        loading.present();
        this.customerService
            .login(this.customer)
            .subscribe((response: CustomerToken) => {
                this.customerService
                    .setCustomerToken(response);
                this.customerService
                    .getCustomerById(response.userId, response.id)
                    .subscribe((customer: Customer) => {
                        loading.dismiss();
                        this.customerService
                            .setCustomer({
                                id: customer.id,
                                email: customer.email,
                                username: customer.username,
                                imageUrl: 'assets/imgs/user-avatar.png'
                            } as Customer);
                        this.goHome();
                    }, (error) => {
                        console.log(error);
                        loading.dismiss();
                        const alert = this.alertCtrl.create({
                            title: 'Error',
                            message: 'Ocurrió un error al iniciar sesión, Intentelo más tarde',
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
