import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from 'ionic-angular';
import { MapComponent } from './map/map';

import { GoogleMaps } from '@ionic-native/google-maps';
import { UtilProvider } from '../providers/util/util';
import { MarkerDetailComponent } from './marker-detail/marker-detail';
import { FbButtonComponent } from './fb-button/fb-button';
import { LogServiceProvider } from '../providers/log/log-service';

@NgModule({
	declarations: [
        MapComponent,
        MarkerDetailComponent,
        FbButtonComponent
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
        MapComponent,
        MarkerDetailComponent,
        FbButtonComponent
    ]
})
export class ComponentsModule {}
