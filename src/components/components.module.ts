import { NgModule } from '@angular/core';
import { MapComponent } from './map/map';

import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

@NgModule({
	declarations: [MapComponent],
    imports: [],
    providers: [
        Geolocation,
        GoogleMaps
    ],
	exports: [MapComponent]
})
export class ComponentsModule {}
