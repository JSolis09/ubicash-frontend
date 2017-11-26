import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    GoogleMapsMapTypeId,
    CameraPosition,
    ILatLng
} from '@ionic-native/google-maps';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import { settings } from '../../environments/environment';

@Component({
    selector: 'map',
    templateUrl: 'map.html'
})
export class MapComponent implements OnInit {
    private map: GoogleMap;

    @ViewChild('map') mapElement: ElementRef;


    constructor(private googleMaps: GoogleMaps,
        private geolocation: Geolocation) { }

        ngOnInit(): void {
            let mapOptions: GoogleMapOptions = {
                camera: {
                    zoom: 18,
                    tilt:30
                },
                mapType: GoogleMapsMapTypeId.ROADMAP
            };
            this.init(mapOptions);
        }

        private init(mapOptions: GoogleMapOptions): void {
            this.map = this.googleMaps.create(this.mapElement.nativeElement, mapOptions);
            this.map
                .one(GoogleMapsEvent.MAP_READY)
                .then(() => {
                    this.getLocation()
                        .then((coords: Coordinates) => {
                            const cameraSettings: CameraPosition<ILatLng> = {
                                target: {
                                    lat: coords.latitude,
                                    lng: coords.longitude
                                },
                                zoom: 18,
                                tilt:30,
                            }
                            this.map
                                .animateCamera(cameraSettings)
                                .then((response) => {
                                    console.log(response);
                                })
                            this.map
                                .addMarker({
                                    title: 'Mi ubicación',
                                    icon: 'blue',
                                    animation: 'DROP',
                                    position: {
                                        lat: cameraSettings.target.lat,
                                        lng: cameraSettings.target.lng
                                    }
                                })
                                .then(marker => {
                                    marker.on(GoogleMapsEvent.MARKER_CLICK)
                                    .subscribe((response) => {
                                        console.log(response);
                                    });
                                });
                        });
                });
        }

        private getLocation(): Promise<Coordinates> {
            return this.geolocation
                .getCurrentPosition()
                .then((resp) => {
                    return {
                        latitude: resp.coords.latitude,
                        longitude: resp.coords.longitude
                    } as Coordinates
                })
                .catch((error) => {
                    if (settings && settings.defaultLocation) {
                        return {
                            latitude: settings.defaultLocation.lat,
                            longitude: settings.defaultLocation.lng
                        } as Coordinates;
                    } else {
                        return {} as Coordinates;
                    }
                });
        }

    }
