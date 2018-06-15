import { Component, Input } from '@angular/core';
import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { Customer, FacebookCustomer } from '../../providers/customer/customer';
import { HomePage } from '../../pages/home/home';

@Component({
    selector: 'fb-button',
    templateUrl: 'fb-button.html'
})
export class FbButtonComponent {
    @Input() text?: string;

    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private loadingCtrl: LoadingController,
                public navCtrl: NavController,
                private fb: Facebook) {
        this.text = this.text || 'Inicia sesión con facebook';
    }

    public fbLogin(): void {
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
                    .api('me?fields=id,email,name,picture', [])
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
                                loading.dismiss();
                                this.customerService
                                    .setCustomerToken(response);
                                this.customerService
                                    .setCustomer({
                                        id: response.userId,
                                        email: data.email,
                                        name: profile['name'],
                                        imageUrl: profile['picture'].data.url
                                    } as Customer);
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
                                            message = 'Ocurrió un error al iniciar sesión, Inténtelo más tarde';
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

    goHome(): void {
        this.navCtrl.setRoot(HomePage);
    }

}
