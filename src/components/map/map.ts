import { Component, ViewChild, OnInit, ElementRef, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    GoogleMapsMapTypeId,
    CameraPosition,
    ILatLng,
    Marker,
    MarkerOptions
} from '@ionic-native/google-maps';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import { settings } from '../../environments/environment';
import { BankDetail } from '../../providers/bank/bank';

@Component({
    selector: 'map',
    templateUrl: 'map.html'
})
export class MapComponent implements OnInit, OnChanges {
    private map: GoogleMap;
    private markers: Marker[];
    private userMarker: Marker;
    private isReady: boolean;

    @Input() animation: boolean;
    @Input() results: BankDetail[];
    @Output() clickMarker: EventEmitter<BankDetail> = new EventEmitter<BankDetail>();
    @ViewChild('map') mapElement: ElementRef;

    constructor(private googleMaps: GoogleMaps,
        private geolocation: Geolocation) {
            this.isReady = false;
            this.markers = [];
            this.results = this.results || [];
         }

        ngOnChanges(): void {
            if (!!this.results && this.isReady) {
                this.clearMarkers();
                this.addMarker();
            }
        }

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
                            this.moveCamera(coords)
                                .then((cameraSettings) => {
                                    this.map
                                        .addMarker({
                                            title: '¡Estás aquí!',
                                            icon: 'assets/icon/user-marker.png',
                                            animation: 'DROP',
                                            position: {
                                                lat: cameraSettings.target.lat,
                                                lng: cameraSettings.target.lng
                                            }
                                        })
                                        .then((marker) => {
                                            this.userMarker = marker;
                                            marker.on(GoogleMapsEvent.MARKER_CLICK)
                                                .subscribe((response) => {
                                                    console.log(response);
                                                });
                                        });
                                    this.addMarker();
                                    this.isReady = true;
                                })
                        });
                });
        }

        private moveCamera(coords: Coordinates): Promise<CameraPosition<ILatLng>> {
            const cameraSettings: CameraPosition<ILatLng> = {
                target: {
                    lat: coords.latitude,
                    lng: coords.longitude
                },
                zoom: 18,
                tilt:30
            };
            const camera: Promise<any> = !!this.animation ? this.map.animateCamera(cameraSettings) : this.map.moveCamera(cameraSettings);
            return camera.then((response) => cameraSettings);
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

        private addMarker(): void {
            this.results
                .forEach((bankDetail: BankDetail) => {
                    const markerOptions: MarkerOptions = {
                        title: bankDetail.address,
                        icon: 'assets/icon/bcp-marker.png',
                        animation: 'DROP',
                        position: {
                            lat: bankDetail.lat,
                            lng: bankDetail.lng
                        }
                    };
                    this.map
                        .addMarker(markerOptions)
                        .then((marker: Marker) => {
                            this.markers.push(marker);
                            marker.on(GoogleMapsEvent.MARKER_CLICK)
                                .subscribe((response) => {
                                    this.clickMarker.emit(bankDetail);
                                });
                        });
                });
        }

        private clearMarkers(): void {
            this.markers
                .forEach((marker) => {
                    marker.remove();
                })
        }

    }
