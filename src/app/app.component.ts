import { Component, ViewChild } from '@angular/core';
import { AlertController, Platform, Nav, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { CustomerServiceProvider } from '../providers/customer/customer-service';
import { Customer, CUSTOMER_NAME, CUSTOMER_TOKEN_NAME } from '../providers/customer/customer';

import { Subscription } from 'rxjs/Subscription';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = LoginPage;
    customer: Customer  = new Customer();
    customerSubscription: Subscription;

    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private loadingCtrl: LoadingController,
                private platform: Platform,
                private statusBar: StatusBar,
                private storage: Storage,
                private splashScreen: SplashScreen) {
            this.platform.ready().then(() => {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                this.statusBar.styleDefault();
                const getCustomer = this.storage.get(CUSTOMER_NAME);
                const getCustomerToken = this.storage.get(CUSTOMER_TOKEN_NAME);
                Promise.all([getCustomer, getCustomerToken])
                    .then((responses) => {
                        this.splashScreen.hide();
                        const customer = responses[0] || {};
                        const customerToken = responses[1] || {};
                        if (customer.id && customerToken.id) {
                            this.customerService
                                .setCustomer(customer);
                            this.customerService
                                .setCustomerToken(customerToken);
                            this.nav
                                .setRoot(HomePage);
                        };
                    });
            });
            this.customerSubscription = this.customerService
                .customerSubject.subscribe((customer) => {
                    this.customer = customer;
                });
        }

        public showAlert(): void {
            const alertOptions = {
                title: '',
                message: '¿Deseas cerrar sesión?',
                buttons: [
                    {
                        cssClass: 'two-button secondary',
                        text: 'No',
                        role: 'cancel'
                    },
                    {
                        cssClass: 'two-button',
                        text: 'Si',
                        handler: () => {
                            this.closeSession();
                        }
                    }
                ]
            };
            const confirm = this.alertCtrl.create(alertOptions);
            confirm.present();
        }

        private closeSession(): void {
            const loading = this.loadingCtrl.create({
                content: 'Cerrando sesión...'
            });
            loading.present();
            this.customerService
                .logout()
                .then(() => {
                    loading.dismiss();
                    this.nav.setRoot(LoginPage);
                }, () => {
                    loading.dismiss();
                    this.nav.setRoot(LoginPage);
                });
        }

        public getFirstName(name: string): string {
            if(name){
                const nameArr = name.split(' ');
                return `${ nameArr[0] } ${nameArr[1]}`;
            }
            return '';
        }
    }
