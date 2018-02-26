import { Component, ViewChild } from '@angular/core';
import { AlertController, Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { CustomerServiceProvider } from '../providers/customer/customer-service';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage:any = LoginPage;

    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private platform: Platform,
                private statusBar: StatusBar,
                private splashScreen: SplashScreen) {
            this.platform.ready().then(() => {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                this.statusBar.styleDefault();
                this.splashScreen.hide();
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
            this.customerService
                .logout()
                .then(() => {
                    this.nav.setRoot(LoginPage);
                });
        }
    }
