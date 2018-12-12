import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  MapType,
  GoogleMapsMapTypeId,
  ILatLng
} from '@ionic-native/google-maps';
import { Component, ViewChild, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy, SimpleChanges, Input, NgZone } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { UtilProvider } from '../../providers/util/util';
import { Subscription } from 'rxjs/Subscription';
import { BankDetail } from '../../providers/bank/bank';
import { LogServiceProvider } from '../../providers/log/log-service';

@Component({
  selector: 'map-bank',
  templateUrl: 'map-bank.html'
})
export class MapBankComponent implements AfterViewInit, OnDestroy {
  @Input() results: BankDetail[];
  @Output() onChangeUserPosition: EventEmitter<Coordinates> = new EventEmitter<Coordinates>();
  @ViewChild('map') mapElement: ElementRef;
  private isReady: boolean;
  private locationPromise: any = null;
  private locationRef: Coordinates;
  private markers: Marker[];
  private updateLocationSubscription: Subscription;
  private userMarker: Marker;
  public map: GoogleMap;
  public bankDetail: BankDetail;

  constructor(private utilProvider: UtilProvider,
              private zone: NgZone,
              private logService: LogServiceProvider,
              private loadingCtrl: LoadingController) {
    this.isReady = false;
    this.markers = [];
    this.results = this.results || [];              
  }

  ngAfterViewInit() {
    this.loadMap();
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

  ngOnDestroy(): void {
    if (this.updateLocationSubscription) {
        this.updateLocationSubscription.unsubscribe();
    };
  }

  public addOrUpdateOwnLocation(coords: Coordinates): void {
    if (this.userMarker) {
        this.userMarker.remove();
    }
    const cameraSettings: CameraPosition<ILatLng> = {
      target: {
          lat: coords.latitude,
          lng: coords.longitude
      },
      zoom: 18,
      tilt:30
    };
    this.map
      .animateCamera(cameraSettings)
      .then(() => {
        this.userMarker = this.map
          .addMarkerSync({
              title: '¡Estás aquí!',
              icon: 'assets/icon/user-marker.png',
              animation: 'DROP',
              draggable: true,
              position: {
                  lat: coords.latitude,
                  lng: coords.longitude
              }
          });
        this.userMarker.showInfoWindow();
        this.userMarker.on(GoogleMapsEvent.MARKER_CLICK)
            .subscribe((response) => { });
        this.userMarker.on(GoogleMapsEvent.MARKER_DRAG_END)
          .subscribe(() => {
              const locationRef = this.userMarker.getPosition();
              this.locationRef = <Coordinates>{
                  latitude: locationRef.lat,
                  longitude: locationRef.lng
              };
              this.onChangeUserPosition.emit(this.locationRef);
          });
      });
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

  private loadMap() {
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
    const spinner = this.loadingCtrl.create({
      spinner: 'hide',
      content: this.utilProvider.getSpinnerHtml(),
      cssClass: 'default-spinner'
    });
    spinner.present();
    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);
    this.map
      .one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        this.isReady = true;
        spinner.dismiss();
        this.getLocation();
        this.addLoacationButtonClickEvent();
      }, () => spinner.dismiss());
  }

  private addLoacationButtonClickEvent() {
    this.updateLocationSubscription = this.map
      .on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK)
      .subscribe(() => {
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
                      this.locationRef = Object.assign({}, currentCoords);
                      this.onChangeUserPosition.emit(this.locationRef);
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
  }

  private getLocation() {
    this.utilProvider
      .getLocation(true)
      .then((coords) => {
        this.addOrUpdateOwnLocation(coords);
        this.onChangeUserPosition.emit(coords);
      }, () => { });
  }

}
