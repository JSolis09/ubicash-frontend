import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from 'ionic-angular';
import { MapComponent } from './map/map';

import { GoogleMaps } from '@ionic-native/google-maps';
import { UtilProvider } from '../providers/util/util';
import { MarkerDetailComponent } from './marker-detail/marker-detail';

@NgModule({
	declarations: [
        MapComponent,
        MarkerDetailComponent
    ],
    imports: [
        BrowserModule,
        IonicModule
    ],
    providers: [
        UtilProvider,
        GoogleMaps
    ],
	exports: [
        MapComponent,
        MarkerDetailComponent
    ]
})
export class ComponentsModule {}
