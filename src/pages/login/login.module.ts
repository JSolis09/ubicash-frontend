import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import { LoginPage } from './login';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
    declarations: [
        LoginPage,
    ],
    providers: [
        Facebook
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(LoginPage),
    ],
})
export class LoginPageModule {}
