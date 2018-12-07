import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Coordinates } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';

import { LoginPage } from '../login/login';
import { Customer } from '../../providers/customer/customer';
import { Bank, BankDetail } from '../../providers/bank/bank';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { LogServiceProvider } from '../../providers/log/log-service';
import { BankServiceProvider } from '../../providers/bank/bank-service';
import { UtilProvider } from '../../providers/util/util';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private bankList: Bank[];
    private limit: number = 10;
    private locationRef: Coordinates;
    private skip: number = 0;
    public bank: string;
    public bankDetailList: BankDetail[];
    public bankDetails: BankDetail[];
    public banks: Observable<Bank[]>;
    public customer: Customer;
    public disabledSearch: boolean;
    public results: BankDetail[];
    public showMap: boolean = false;
    public typeView: boolean = true;
    
    constructor(private alertCtrl: AlertController,
                private bankService: BankServiceProvider,
                private customerService: CustomerServiceProvider,
                private loadingCtrl: LoadingController,
                private logService: LogServiceProvider,
                private navCtrl: NavController,
                private utilProvider: UtilProvider) {}

    ionViewDidLoad() {
        this.bankDetails = [];
        this.bankDetailList = [];
        this.results = [];
        this.customer = this.customerService.getCustomer();
        this.banks = this.bankService
            .getAll()
            .map((banks) => {
                this.showMap = true;
                return this.bankList = [...banks]
            })
            .catch((error) => {
                this.showMap = false;
                this.customerService
                    .logout()
                    .then(() => { });
                this.navCtrl.setRoot(LoginPage);
                return [];
            });
        this.utilProvider
            .getLocation()
            .then((coords) => {
                this.locationRef = Object.assign({}, coords);
                this.utilProvider.setCurrentLocation(this.locationRef);
            })
            .catch((error) => { });
    }

    private saveLog(bank: Bank): void {
        this.utilProvider
            .getLocation()
            .then((coords) => {
                this.logService
                    .save({
                        bank_name: bank.name,
                        location: {...coords}
                    });
            })
            .catch((error) => { });
    }

    private mapBankList(bank: Bank): void {
        this.bankDetails = this.bankDetails
            .map((bankDetail: BankDetail) => Object.assign(bankDetail, {
                bank: Object.assign({}, bank)
            }));
    }

    private resetBankDetailList(): void {
        this.skip = 0;
        this.bankDetailList = [];
    }

    private setBankDetailList(): void {
        this.bankDetailList = [...this.bankDetails.slice(this.skip, this.limit)];
        this.skip = this.limit;
    }

    private getBankDetails(bank: Bank, locationRef: Coordinates): void {
        const loading = this.loadingCtrl.create({
            content: 'Buscando ...'
        });
        loading.present();
        this.resetBankDetailList();
        this.bankService
            .getBankDetails(bank.id, locationRef)
            .subscribe((bankDetails: BankDetail[]) => {
                this.results = [...bankDetails];
                this.bankDetails = bankDetails || [];
                this.mapBankList(bank);
                this.setBankDetailList();
                loading.dismiss();
                if (this.bankDetails.length === 0) {
                    const alert = this.alertCtrl.create({
                        title: '',
                        message: 'No se encontraron coincidencias',
                        buttons: [
                            {
                                text: 'Aceptar',
                                cssClass: 'one-button'
                            }
                        ]
                    });
                    alert.present();
                }
            }, () => {
                loading.dismiss();
            });
    }

    private recalculateDistances(): void {
        this.bankDetails = this.bankDetails
            .map((bankDetail: BankDetail) => {
                return Object.assign(bankDetail, {
                    distance: this.utilProvider.getDistanceBetween({
                        lat: bankDetail.lat,
                        lng: bankDetail.lng
                    }, {
                        lat: this.locationRef.latitude,
                        lng: this.locationRef.longitude
                    })
                });
            })
            .sort((a, b) => {
                if (a.distance > b.distance) {
                    return 1
                }
                if (a.distance < b.distance) {
                    return -1
                }
                return 0;
            });
        this.resetBankDetailList();
        this.setBankDetailList();
    }

    public changeBank(): void {
        const bank: Bank = this.bankService.getBankById(this.bankList, this.bank);
        this.disabledSearch = true;
        this.saveLog(bank);
        this.getBankDetails(bank, this.locationRef);
    }

    public getMoreBankDetail(infiniteScroll: any): void {
        if (this.skip >= this.bankDetails.length) {
            infiniteScroll.complete();
        }
        setTimeout(() => {
            const newBankDetailList = this.bankDetails.slice(this.skip, this.skip + this.limit);
            this.bankDetailList = this.bankDetailList.concat(newBankDetailList);
            this.skip += newBankDetailList.length;
            infiniteScroll.complete();
        }, 500);
    }

    public onChangeUserPosition(locationRef: Coordinates): void {
        this.locationRef = Object.assign({}, locationRef);
        this.utilProvider.setCurrentLocation(this.locationRef);
        this.recalculateDistances();
    }

}
