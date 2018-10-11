import { Component, ViewChild, OnInit, OnDestroy, ElementRef, Input, OnChanges, NgZone } from '@angular/core';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    GoogleMapsMapTypeId,
    CameraPosition,
    ILatLng,
    Marker,
    MarkerOptions,
    MapType
} from '@ionic-native/google-maps';
import { Coordinates } from '@ionic-native/geolocation';
import { BankDetail } from '../../providers/bank/bank';
import { UtilProvider } from '../../providers/util/util';
import { LogServiceProvider } from '../../providers/log/log-service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'map',
    templateUrl: 'map.html'
})
export class MapComponent implements OnInit, OnDestroy, OnChanges {
    private map: GoogleMap;
    private markers: Marker[];
    private userMarker: Marker;
    private isReady: boolean;
    private myLocation: Coordinates;
    public bankDetail: BankDetail;
    private updateLocationSubscription: Subscription;

    @Input() animation: boolean;
    @Input() results: BankDetail[];
    @ViewChild('map') mapElement: ElementRef;

    constructor(private googleMaps: GoogleMaps,
                private zone: NgZone,
                private logService: LogServiceProvider,
                private utilProvider: UtilProvider) {
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
        this.init();
    }

    ngOnDestroy(): void {
        if (this.updateLocationSubscription) {
            this.updateLocationSubscription.unsubscribe();
        };
    }

    public addOrUpdateOwnLocation(coords: Coordinates): void {
        if (this.userMarker) {
            this.userMarker.remove();
            console.log('User marker removed...', this.userMarker);
        }
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
                        console.log('User marker added...', this.userMarker);
                        marker.on(GoogleMapsEvent.MARKER_CLICK)
                            .subscribe((response) => { });
                    });
            });
    }

    private init(): void {
        const mapOptions: GoogleMapOptions = {
            controls: {
                myLocationButton: true,
            },
            camera: {
                zoom: 18,
                tilt:30
            },
            mapType: <MapType>GoogleMapsMapTypeId.ROADMAP
        };
        this.map = this.googleMaps.create(this.mapElement.nativeElement, mapOptions);
        this.map
            .one(GoogleMapsEvent.MAP_READY)
            .then(() => {
                this.updateLocationSubscription = this.map
                    .on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK)
                    .subscribe((coords) => {
                        this.map
                            .getMyLocation()
                            .then((response) => {
                                if (response.latLng) {
                                    const currentCoords: Coordinates = {
                                        latitude: response.latLng.lat,
                                        longitude: response.latLng.lng
                                    } as Coordinates;
                                    this.addOrUpdateOwnLocation(currentCoords);         
                                }
                            });
                    });
                this.utilProvider
                    .getLocation(true)
                    .then((coords: Coordinates) => {
                        this.myLocation = coords;
                        this.addOrUpdateOwnLocation(coords);
                        this.addMarker();
                        this.isReady = true;
                    }).catch((error) => {
                        this.isReady = true;
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

    private addMarker(): void {
        this.results
            .forEach((bankDetail: BankDetail) => {
                const markerOptions: MarkerOptions = {
                    icon: 'assets/icon/bcp-marker.png',
                    position: {
                        lat: bankDetail.lat,
                        lng: bankDetail.lng
                    }
                };
                this.map
                    .addMarker(markerOptions)
                    .then((marker: Marker) => {
                        this.markers.push(marker);
                        marker.addEventListener(GoogleMapsEvent.MARKER_CLICK)
                            .subscribe((response) => {
                                this.zone
                                    .run(() => {
                                        this.bankDetail = Object.assign<any, BankDetail>({}, bankDetail);
                                        this.logService
                                            .save({
                                                bank_name: this.bankDetail.bank.name,
                                                branch: this.bankDetail,
                                                location: this.myLocation
                                            });
                                    });
                            });
                    });
            });
    }

    private clearMarkers(): void {
        this.bankDetail = null;
        this.markers
            .forEach((marker) => {
                marker.remove();
            });
    }

}
