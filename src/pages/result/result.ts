import { Component } from '@angular/core';
import { AlertController, IonicPage, NavParams, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Bank, BankDetail } from '../../providers/bank/bank';
import { BankServiceProvider } from '../../providers/bank/bank-service';

@IonicPage()
@Component({
    selector: 'page-result',
    templateUrl: 'result.html',
})
export class ResultPage {
    public bank: string;
    public banks: Observable<Bank[]>;
    public bankDetails: BankDetail[];

    constructor(private alertCtrl: AlertController,
                private navParams: NavParams,
                private loadingCtrl: LoadingController,
                private bankService: BankServiceProvider) {
        this.banks = this.bankService.getAll();
        this.banks
            .subscribe((banks) => {
                this.bank = this.navParams.get('bank');
                this.getBankDetails(this.bank);
            });
    }

    getBankDetails(bankId: string): void {
        const loading = this.loadingCtrl.create({
            content: 'Buscando ...'
        });
        loading.present();
        this.bankService
            .getBankDetails(bankId)
            .subscribe((bankDetails: BankDetail[]) => {
                this.bankDetails = bankDetails || [];
                loading.dismiss();
                if (this.bankDetails.length === 0) {
                    const alert = this.alertCtrl.create({
                        title: '',
                        message: 'No se encontraron coincidencias',
                        buttons: [{
                            text: 'Aceptar',
                            cssClass: 'one-button',
                        }]
                    });
                    alert.present();
                }
            }, () => {
                loading.dismiss();
            });
    }

    changeBank(): void {
        this.getBankDetails(this.bank);
    }

    onClickMarker($event: BankDetail): void {
        console.log($event);
    }

}
