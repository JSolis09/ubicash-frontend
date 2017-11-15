import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';

import { Facebook } from '@ionic-native/facebook';

@NgModule({
  declarations: [
    LoginPage,
  ],
  providers: [
      Facebook
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
