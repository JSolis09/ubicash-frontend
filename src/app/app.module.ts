import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { ComponentsModule } from '../components/components.module';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPageModule } from '../pages/login/login.module';
import { RegisterUserPageModule } from '../pages/register-user/register-user.module';
import { ResultPageModule } from  '../pages/result/result.module';
import { AppiServiceModule } from '../providers/api-service/api-service.module';
import { CustomerServiceProvider } from '../providers/customer/customer-service';
import { IonicStorageModule } from '@ionic/storage';
import { BankServiceProvider } from '../providers/bank/bank-service';

@NgModule({
    declarations: [
        MyApp,
        HomePage
    ],
    imports: [
        AppiServiceModule,
        BrowserModule,
        ComponentsModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        LoginPageModule,
        RegisterUserPageModule,
        ResultPageModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        CustomerServiceProvider,
        BankServiceProvider
    ]
})
export class AppModule {}
