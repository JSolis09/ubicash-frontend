import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { Customer } from '../../providers/customer/customer';

import { LoginPage } from '../login/login';
import { TranslateProvider } from '../../providers/util/translate';

@IonicPage()
@Component({
    selector: 'page-register-user',
    templateUrl: 'register-user.html',
})
export class RegisterUserPage implements OnInit {
    public user: FormGroup;

    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private loadingCtrl: LoadingController,
                private translateProvider: TranslateProvider,
                public navCtrl: NavController,
                public navParams: NavParams) {
        }

        ngOnInit(): void {
            this.user = new FormGroup({
                username: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
                password: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
                repeatPassword: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
                email: new FormControl('', [ Validators.email ])
            });
        }

        ionViewDidLoad() {
            console.log('ionViewDidLoad RegisterUserPage');
        }

        private generateErrorMessage(error: any): string {
            const details = error.details || {};
            const codes = details.codes || {};
            const emailError = codes.email;
            const usernameError = codes.username;
            const messages = details.messages;
            if (usernameError) {
                const usernameMessage = messages.username.find((item) => true);
                return this.translateProvider.translate(usernameMessage);
            }
            if (emailError) {
                const emailMessage = messages.email.find((item) => true);
                return this.translateProvider.translate(emailMessage);
            }

            return 'Ocurrió un error a la hora de registrar';
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

        public register(user: FormGroup): void {
            if (user.valid) {
                const userValues = user.value;
                const customer: Customer = {
                    email: userValues.email,
                    password: userValues.password,
                    username: userValues.username
                };
                const loading = this.loadingCtrl.create({
                    content: 'Registrando...'
                });
                loading.present();
                this.customerService
                    .create(customer)
                    .subscribe((response) => {
                        loading.dismiss();
                        const alert = this.alertCtrl.create({
                            title: '',
                            message: 'Se registró correctamente',
                            buttons: [{
                                text: 'Aceptar',
                                cssClass: 'one-button',
                                handler: () => {
                                    this.navCtrl.setRoot(LoginPage);
                                }
                            }]
                        });
                        alert.present();
                    }, (responseError) => {
                        loading.dismiss();
                        const error = responseError.error || {};
                        const alert = this.alertCtrl.create({
                            title: 'Error',
                            message: this.generateErrorMessage(error),
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

    }
