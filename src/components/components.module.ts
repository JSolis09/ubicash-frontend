import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from 'ionic-angular';

import { GoogleMaps } from '@ionic-native/google-maps';
import { UtilProvider } from '../providers/util/util';
import { MarkerDetailComponent } from './marker-detail/marker-detail';
import { FbButtonComponent } from './fb-button/fb-button';
import { LogServiceProvider } from '../providers/log/log-service';
import { MapBankComponent } from './map-bank/map-bank';

@NgModule({
	declarations: [
        MarkerDetailComponent,
        FbButtonComponent,
        MapBankComponent
    ],
    imports: [
        BrowserModule,
        IonicModule
    ],
    providers: [
        UtilProvider,
        GoogleMaps,
        LogServiceProvider
    ],
	exports: [
        MarkerDetailComponent,
        FbButtonComponent,
        MapBankComponent
    ]
})
export class ComponentsModule {}
