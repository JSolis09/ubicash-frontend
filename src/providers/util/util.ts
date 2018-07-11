import { Injectable } from '@angular/core';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import { Spherical, ILatLng } from '@ionic-native/google-maps';

import { AlertController, LoadingController } from 'ionic-angular';

@Injectable()
export class UtilProvider {

    constructor(private alertCtrl: AlertController,
                private geolocation: Geolocation,
                private loadingCtrl: LoadingController) { }

    public getDistanceBetween(from: ILatLng, to: ILatLng ): number {
        let distance: number;
        try {
            distance = Spherical.computeDistanceBetween(from, to)/1000;
        } catch(e) {
            distance = this.getDistanceFromLatLonInKm(from.lat, from.lng, to.lat, to.lng);
        } finally {
            return +distance.toFixed(2);
        }
    }

    public getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        var R = 6371;
        var dLat = this.deg2rad(lat2-lat1);
        var dLon = this.deg2rad(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d;
    }

    public getLocation(show?: boolean): Promise<Coordinates | any> {
        const loading = this.loadingCtrl.create({
            spinner: 'hide',
            content: 'Obteniendo ubicación...'
        });
        return new Promise((resolve, reject) => {
            this.geolocation
            .getCurrentPosition()
            .then((resp) => {
                resolve({
                    latitude: resp.coords.latitude,
                    longitude: resp.coords.longitude
                } as Coordinates);
            })
            .catch((error) => {
                loading.dismiss();
                if (show) {
                    const alert = this.alertCtrl.create({
                        title: 'Error',
                        message: 'No se pudo obtener su ubicación',
                        buttons: [
                            {
                                text: 'cerrar',
                                role: 'cancel',
                                cssClass: 'one-button'
                            }
                        ]
                    });
                    alert.present();
                }
                reject(error);
            });
        });
    }

    private deg2rad(deg): number {
        return deg * (Math.PI/180)
    }

}
