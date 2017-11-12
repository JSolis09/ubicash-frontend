import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Customer } from '../../providers/customer/customer';

import { LoginPage } from '../login/login';

@IonicPage()
@Component({
    selector: 'page-register-user',
    templateUrl: 'register-user.html',
})
export class RegisterUserPage implements OnInit {
    public user: FormGroup;

    constructor(private alertCtrl: AlertController,
                private apiService: ApiServiceProvider,
                private loadingCtrl: LoadingController,
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
                this.apiService
                    .post('Users', customer)
                    .subscribe((response) => {
                        loading.dismiss();
                        const alert = this.alertCtrl.create({
                            title: 'Se registró correctamente',
                            buttons: [{
                                text: 'Aceptar',
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
                            subTitle: error.message || 'Ocurrió un error al iniciar sesión, Intentelo más tarde',
                            buttons: ['Cerrar']
                        });
                        alert.present();
                    });
            }
        }

    }
