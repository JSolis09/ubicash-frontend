import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ResultPage } from './result';
import { ComponentsModule } from '../../components/components.module';
import { UtilProvider } from '../../providers/util/util';

@NgModule({
  declarations: [
    ResultPage,
  ],
  providers: [
      UtilProvider
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ResultPage),
  ],
})
export class ResultPageModule {}
