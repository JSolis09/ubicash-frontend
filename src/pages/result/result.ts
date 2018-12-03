import { Component } from '@angular/core';
import { AlertController, IonicPage, NavParams, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Coordinates } from '@ionic-native/geolocation';
import { Customer } from '../../providers/customer/customer';
import { CustomerServiceProvider } from '../../providers/customer/customer-service';
import { Bank, BankDetail } from '../../providers/bank/bank';
import { BankServiceProvider } from '../../providers/bank/bank-service';
import { LogServiceProvider } from '../../providers/log/log-service';
import { UtilProvider } from '../../providers/util/util';

@IonicPage()
@Component({
    selector: 'page-result',
    templateUrl: 'result.html',
})
export class ResultPage {
    private bankList: Bank[];
    private limit: number = 10;
    private skip: number = 0;
    public bank: Bank;
    public bankDetail: BankDetail;
    public bankDetailList: BankDetail[];
    public bankDetails: BankDetail[];
    public bankId: string;
    public banks: Observable<Bank[]>;
    public customer: Customer;
    public disabledSearch: boolean;
    public isFirstTime: boolean;
    public locationSubject: Subject<Coordinates> = new Subject<Coordinates>();
    public locationRef: Coordinates;
    public showMap: Boolean;
    public typeView: boolean = true;
    
    constructor(private alertCtrl: AlertController,
                private customerService: CustomerServiceProvider,
                private navParams: NavParams,
                private loadingCtrl: LoadingController,
                private logService: LogServiceProvider,
                private utilProvider: UtilProvider,
                private bankService: BankServiceProvider) {
        this.customer = this.customerService.getCustomer();
        this.bankDetails = [];
        this.bankDetailList = [];
        this.locationRef = Object.assign({
            latitude: '',
            longitude: ''
        }, this.navParams.get('locationRef'));
        this.showMap = true;
    }

    ionViewDidEnter() {
        this.banks = this.bankService.getAll();
        this.bank = this.navParams.get('bank');
        this.disabledSearch = true;
        this.isFirstTime = false;
        this.banks
            .subscribe((banks) => {
                this.disabledSearch = false;
                this.bankList = [...banks];
                this.bankId = this.bank.id;
                this.getBankDetails(this.bankId, this.locationRef);
            }, () => {
                this.disabledSearch = false;
            });
    }

    public getBankDetails(bankId: string, locationRef: Coordinates): void {
        const loading = this.loadingCtrl.create({
            content: 'Buscando ...'
        });
        loading.present();
        this.resetBankDetailList();
        this.bankService
            .getBankDetails(bankId, locationRef)
            .subscribe((bankDetails: BankDetail[]) => {
                const bank = Object.assign({}, this.bank);
                this.bankDetails = bankDetails || [];
                this.mapBankList(this.bankDetails, bank);
                this.getBankDetailList();
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

    private mapBankList(bankDetails: BankDetail[], bank: Bank): void {
        bankDetails.forEach((bankDetail) => {
            bankDetail.bank = bank;
        });
    }

    private resetBankDetailList(): void {
        this.skip = 0;
        this.bankDetailList = [];
    }

    private getBankDetailList(): void {
        this.bankDetailList = this.bankDetails.slice(this.skip, this.limit);
        this.skip = this.limit;
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
            });
    }

    public changeBank(): void {
        this.bank = this.bankService.getBankById(this.bankList, this.bankId);
        this.getBankDetails(this.bankId, this.locationRef);
        this.utilProvider
            .getLocation()
            .then((coords) => {
                this.logService
                    .save({
                        bank_name: this.bank.name,
                        location: coords
                    });
            }, () => { });
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
