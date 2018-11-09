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
    private myLocation: Coordinates;
    private skip: number = 0;
    public bank: Bank;
    public bankDetail: BankDetail;
    public bankDetailList: BankDetail[];
    public bankDetails: BankDetail[];
    public bankId: string;
    public banks: Observable<Bank[]>;
    public customer: Customer;
    public typeView: boolean = true;
    public locationSubject: Subject<Coordinates> = new Subject<Coordinates>();

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
                    }, (error) => {});
            });
    }

    public getBankDetails(bankId: string): void {
        const loading = this.loadingCtrl.create({
            content: 'Buscando ...'
        });
        loading.present();
        this.resetBankDetailList();
        this.bankService
            .getBankDetails(bankId, this.myLocation)
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

    public changeBank(): void {
        this.bank = this.bankService.getBankById(this.bankList, this.bankId);
        this.utilProvider
            .getLocation(true)
            .then((coords) => {
                this.myLocation = coords;
                this.logService
                    .save({
                        bank_name: this.bank.name,
                        location: this.myLocation
                    });
                this.getBankDetails(this.bankId);
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

}
