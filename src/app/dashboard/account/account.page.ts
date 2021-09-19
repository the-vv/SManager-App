import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';
import { CashService } from 'src/app/services/cash.service';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  constructor(
    public user: UserService,
    public alertController: AlertController,
    public cashService: CashService
  ) { }

  ngOnInit() {
    this.getProfileIcon();
  }
  getProfileIcon() {
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
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
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

}
