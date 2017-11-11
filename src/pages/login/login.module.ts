import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';

import { AppiServiceModule } from '../../providers/api-service/api-service.module';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    AppiServiceModule,
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
