import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultPage } from './result';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ResultPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ResultPage),
  ],
})
export class ResultPageModule {}
