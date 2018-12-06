import { Component, ViewChild, OnInit, OnDestroy, ElementRef, Input, OnChanges, NgZone, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
import { Subject } from 'rxjs/Subject';
import { LoadingController } from 'ionic-angular';

@Component({
    selector: 'map',
    templateUrl: 'map.html'
})
export class MapComponent implements OnInit, OnDestroy, OnChanges {
    
    @Input() animation: boolean;
    @Input() defaultLocation: Coordinates;
    @Input() observeLocation: Subject<Coordinates>;
    @Input() results: BankDetail[];
    @Output() onChangeUserPosition: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();
    @ViewChild('map') mapElement: ElementRef;
    private isReady: boolean;
    private locationRef: Coordinates;
    private map: GoogleMap;
    private markers: Marker[];
    private observeLocationSubscription: Subscription;
    private updateLocationSubscription: Subscription;
    private userMarker: Marker;
    private locationPromise: any = null;
    public bankDetail: BankDetail;
    
    constructor(private googleMaps: GoogleMaps,
        private zone: NgZone,
        private loadingCtrl: LoadingController,
        private logService: LogServiceProvider,
        private utilProvider: UtilProvider) {
            this.isReady = false;
            this.markers = [];
            this.results = this.results || [];
        }
        
        ngOnChanges(changes: SimpleChanges): void {
            if (this.isReady) {
                if (changes['results'] && changes['results'].previousValue) {
                    const currentValue = JSON.stringify(changes['results'].currentValue);
                    const previousValue = JSON.stringify(changes['results'].previousValue);
                    if (currentValue !== previousValue) {
                        this.clearMarkers();
                        this.addMarker();
                    }
                }
            }
        }
        
        ngOnInit(): void {
            this.init();
            if (this.observeLocation) {
                this.observeLocationSubscription = this.observeLocation
                    .subscribe((coords: Coordinates) => {
                        if (this.utilProvider.isDifferentLocation(this.locationRef, coords)) {
                            this.locationRef = Object.assign({}, coords);
                            this.addOrUpdateOwnLocation(coords);
                        }
                    });
            }
        }
        
        ngOnDestroy(): void {
            if (this.updateLocationSubscription) {
                this.updateLocationSubscription.unsubscribe();
            };
            if (this.observeLocationSubscription) {
                this.observeLocationSubscription.unsubscribe();
            };
        }

        public addOrUpdateOwnLocation(coords: Coordinates): void {
            if (this.userMarker) {
                this.userMarker.remove();
            }
            this.moveCamera(coords)
            .then((cameraSettings) => {
                this.map
                .addMarker({
                    title: '¡Estás aquí!',
                    icon: 'assets/icon/user-marker.png',
                    animation: 'DROP',
                    draggable: true,
                    position: {
                        lat: cameraSettings.target.lat,
                        lng: cameraSettings.target.lng
                    }
                })
                .then((marker) => {
                    this.userMarker = marker;
                    marker.on(GoogleMapsEvent.MARKER_CLICK)
                        .subscribe((response) => { });
                    marker.on(GoogleMapsEvent.MARKER_DRAG_END)
                        .subscribe(() => {
                            const locationRef = marker.getPosition();
                            this.locationRef = <Coordinates>{
                                latitude: locationRef.lat,
                                longitude: locationRef.lng
                            };
                            this.onChangeUserPosition.emit(this.locationRef);
                        });
                });
            });
        }
        
        private init(): void {
            let mapOptions: GoogleMapOptions = {
                controls: {
                    myLocationButton: true,
                },
                camera: {
                    zoom: 18,
                    tilt:30
                },
                mapType: <MapType>GoogleMapsMapTypeId.ROADMAP
            };
            if (this.defaultLocation) {
                mapOptions = Object.assign(mapOptions, {
                    camera: {
                        target: {
                            lat: this.defaultLocation.latitude,
                            lng: this.defaultLocation.longitude
                        }
                    }
                });
            }
            this.map = this.googleMaps.create(this.mapElement.nativeElement, mapOptions);
            this.map
                .one(GoogleMapsEvent.MAP_READY)
                .then(() => {
                    this.updateLocationSubscription = this.map
                        .on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK)
                        .subscribe((coords) => {
                            if (!this.locationPromise) {
                                const spinner = this.loadingCtrl.create({
                                    spinner: 'hide',
                                    content: this.utilProvider.getSpinnerHtml(),
                                    cssClass: 'default-spinner'
                                });
                                spinner.present();
                                this.locationPromise = this.map
                                    .getMyLocation()
                                    .then((response) => {
                                        if (response.latLng) {
                                            const currentCoords: Coordinates = {
                                                latitude: response.latLng.lat,
                                                longitude: response.latLng.lng
                                            } as Coordinates;
                                            this.addOrUpdateOwnLocation(currentCoords);         
                                        }
                                        this.locationPromise = null;
                                        spinner.dismiss();
                                    }, () => {
                                        this.locationPromise = null;
                                        spinner.dismiss();
                                    });
                            }
                        });
                    if (this.defaultLocation) {
                        this.locationRef = Object.assign({}, this.defaultLocation);
                        this.addOrUpdateOwnLocation(this.locationRef);
                        this.addMarker();
                        this.isReady = true;
                    } else {
                        this.utilProvider
                            .getLocation(true)
                            .then((coords: Coordinates) => {
                                this.locationRef = Object.assign({}, coords);
                                this.addOrUpdateOwnLocation(coords);
                                this.addMarker();
                                this.isReady = true;
                            }).catch((error) => {
                                this.isReady = true;
                            });
                    }
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
            const allMarkerPromise = [];
            if (this.results && this.results.length) {
                const spinner = this.loadingCtrl.create({
                    spinner: 'hide',
                    content: this.utilProvider.getSpinnerHtml(),
                    cssClass: 'default-spinner'
                });
                spinner.present();
                this.results
                    .forEach((bankDetail: BankDetail) => {
                        const markerOptions: MarkerOptions = {
                            icon: 'assets/icon/bcp-marker.png',
                            position: {
                                lat: bankDetail.lat,
                                lng: bankDetail.lng
                            }
                        };
                        allMarkerPromise.push(this.map.addMarker(markerOptions));
                    });
                Promise.all(allMarkerPromise)
                    .then((markers: Marker[]) => {
                        this.markers = markers.map((marker, index) => {
                            marker.addEventListener(GoogleMapsEvent.MARKER_CLICK)
                                .subscribe((response) => {
                                    this.zone
                                    .run(() => {
                                        this.bankDetail = Object.assign<any, BankDetail>({}, this.results[index]);
                                        this.logService
                                            .save({
                                                bank_name: this.bankDetail.bank.name,
                                                branch: this.bankDetail,
                                                location: this.locationRef
                                            });
                                    });
                                });
                            return marker;
                        });
                        spinner.dismiss();
                    }), () => {
                        spinner.dismiss();
                    };
            }
        }
        
        private clearMarkers(): void {
            this.bankDetail = null;
            this.markers
                .forEach((marker) => {
                    marker.remove();
                });
        }
        
    }
    