import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IAccount } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  public allAccounts: IAccount[] = [];

  constructor(
    public config: ConfigService,
    public alertController: AlertController,
    public cashService: CashService,
    private user: UserService,
    private firebase: FirebaseService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.firebase.getUserAccounts().subscribe((accounts) => {
      this.allAccounts = accounts;
    });
  }

  async confirmClear() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm!',
      message: 'Are you sure want to clear all data?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Clear',
          handler: () => {
            this.cashService.clearAll();
          }
        }
      ]
    });
    await alert.present();
  }

  async addAccountsPopup() {
    const alert = await this.alertController.create({
      header: 'Please enter your account info',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Create',
          role: 'create',
        }
      ],
      inputs: [
        {
          placeholder: 'Account Name',
          label: 'Account Name',
          attributes: {
            autocapitalize: true,
          }
        }
      ],
    });
    await alert.present();
    alert.onDidDismiss().then((value) => {
      const accountName = value?.data.values?.[0];
      if (accountName && value?.role === 'create') {
        console.log(accountName);
      }
    });
  }

  onLogout() {
    this.user.logout();
  }

}
