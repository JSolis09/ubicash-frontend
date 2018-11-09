import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { LoginPage } from '../login/login';
import { PasswordReset } from '../../providers/customer/customer';
import { TranslateProvider } from '../../providers/util/translate';

@IonicPage()
@Component({
    selector: 'page-forgot-password',
    templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage implements OnInit {
    public email: string;
    public user: FormGroup;
    public isSent: boolean;
    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private loadingCtrl: LoadingController,
                private translateProvider: TranslateProvider,
                public navCtrl: NavController,
                public navParams: NavParams) {
    }

    ngOnInit() {
        this.user = new FormGroup({
            code: new FormControl('', [ Validators.required, Validators.minLength(6), Validators.maxLength(6) ]),
            password: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
            repeatPassword: new FormControl('', [ Validators.required, Validators.minLength(8) ])
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ForgotPasswordPage');
    }

    public resetPassword() {
        this.isSent = false;
        const loading = this.loadingCtrl
            .create({
                content: 'Enviando código de validación...'
            });
        loading.present();
        this.customerService
            .resetPassword({ email: this.email })
            .subscribe(() => {
                loading.dismiss()
                    .then(() => {
                        this.isSent = true;
                    });
            }, (response) => {
                const error = response.error || {};
                loading.dismiss();
                this.isSent = false;
                const alert = this.alertCtrl.create({
                    title: 'Error',
                    message: this.translateProvider.translate(error.code),
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

    public savePassword(user: FormGroup): void {
        if (user.valid) {
            const userValues = user.value;
            const passwordReset: PasswordReset = {
                password: userValues.password,
                code: userValues.code,
                email: this.email
            };
            const loading = this.loadingCtrl
                .create({
                    content: 'Reseteando contraseña...'
                });
            loading.present();
            this.customerService
                .resetPasswordCode(passwordReset)
                .subscribe(() => {
                    loading.dismiss();
                    const alert = this.alertCtrl.create({
                        title: '',
                        message: 'Se cambió su contraseña correctamente',
                        buttons: [{
                            text: 'Aceptar',
                            cssClass: 'one-button',
                            handler: () => {
                                this.navCtrl.setRoot(LoginPage);
                            }
                        }]
                    });
                    alert.present();
                }, (errorResponse) => {
                    loading.dismiss();
                    const error = errorResponse.error;
                    let message;
                    if (error && error.code === 'VERIFY_FAILED'){
                        message = 'El email o el código son incorrectos';
                    }else {
                        message = 'Ocurrió un error al cambiar la contraseña, intentelo nuevamente';
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

    public unmatchPassword(user): any {
        const password = user.get('password').value;
        const repeatPassword = user.get('repeatPassword').value;
        if (!!password && !!repeatPassword) {
            return password !== repeatPassword;
        } else {
            return false;
        }
    }

}
