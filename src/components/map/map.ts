import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions
} from '@ionic-native/google-maps';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';

@Component({
    selector: 'map',
    templateUrl: 'map.html'
})
export class MapComponent implements OnInit {
    private map: GoogleMap;
    private myLocation: Coordinates;

    @ViewChild('map') mapElement: ElementRef;


    constructor(private googleMaps: GoogleMaps,
        private geolocation: Geolocation) { }

        ngOnInit(): void {
            let mapOptions: GoogleMapOptions = {
                camera: {
                    zoom: 18,
                    tilt:30,
                }
            };
            this.getLocation()
                .then((coords) => {
                    mapOptions.camera
                        .target = {
                            lat: coords.latitude,
                            lng: coords.longitude
                        };
                    this.init(mapOptions);
                })
                .catch(() => {
                    this.init(mapOptions);
                });
        }

        private init(mapOptions: GoogleMapOptions): void {
            this.map = this.googleMaps.create(this.mapElement.nativeElement, mapOptions);
            if (!!mapOptions && !!mapOptions.camera.target) {
                this.map
                .one(GoogleMapsEvent.MAP_READY)
                .then(() => {
                    this.map
                        .addMarker({
                            title: 'Me',
                            icon: 'blue',
                            animation: 'DROP',
                            position: {
                                lat: mapOptions.camera.target.lat,
                                lng: mapOptions.camera.target.lng
                            }
                        })
                        .then(marker => {
                            marker.on(GoogleMapsEvent.MARKER_CLICK)
                                .subscribe(() => {
                                    console.log('clicked');
                                });
                        });
                });
            }
        }

        private getLocation(): Promise<Coordinates> {
            return this.geolocation
                .getCurrentPosition()
                .then((resp) => {
                    return {
                        latitude: resp.coords.latitude,
                        longitude: resp.coords.longitude
                    } as Coordinates
                });
        }

}
