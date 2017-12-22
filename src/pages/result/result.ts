import { Component } from '@angular/core';
import { AlertController, IonicPage, NavParams, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Coordinates } from '@ionic-native/geolocation';
import { Bank, BankDetail } from '../../providers/bank/bank';
import { BankServiceProvider } from '../../providers/bank/bank-service';
import { UtilProvider } from '../../providers/util/util';

@IonicPage()
@Component({
    selector: 'page-result',
    templateUrl: 'result.html',
})
export class ResultPage {
    private myLocation: Coordinates;
    private bankList: Bank[];
    public bankId: string;
    public bank: Bank;
    public banks: Observable<Bank[]>;
    public bankDetails: BankDetail[];
    public bankDetailList: BankDetail[];
    public bankDetail: BankDetail;
    public typeView: boolean = false;
    private limit: number = 10;
    private skip: number = 0;

    constructor(private alertCtrl: AlertController,
                private navParams: NavParams,
                private loadingCtrl: LoadingController,
                private utilProvider: UtilProvider,
                private bankService: BankServiceProvider) {
        this.bankDetails = [];
        this.bankDetailList = [];
        this.banks = this.bankService.getAll();
        this.banks
            .subscribe((banks) => {
                this.bankList = banks;
                this.bank = this.navParams.get('bank');
                this.bankId = this.bank.id;
                this.utilProvider
                    .getLocation()
                    .then((coords) => {
                        this.myLocation = coords;
                        this.getBankDetails(this.bankId);
                    });
            });
    }

    public getBankDetails(bankId: string): void {
        const loading = this.loadingCtrl.create({
            content: 'Buscando ...'
        });
        loading.present();
        this.resetBankDetailList();
        this.bankService
            .getBankDetails(bankId)
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
            if (!!this.myLocation) {
                bankDetail.distance = this.utilProvider.getDistanceBetween({
                    lat: bankDetail.lat,
                    lng: bankDetail.lng
                }, {
                    lat: this.myLocation.latitude,
                    lng: this.myLocation.longitude
                });
            }
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

    public changeBank(): void {
        this.bank = this.bankService.getBankById(this.bankList, this.bankId);
        this.getBankDetails(this.bankId);
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

}