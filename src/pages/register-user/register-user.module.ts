import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '../../components/components.module';
import { RegisterUserPage } from './register-user';

@NgModule({
    declarations: [
        RegisterUserPage,
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(RegisterUserPage),
    ],
})
export class RegisterUserPageModule {}
