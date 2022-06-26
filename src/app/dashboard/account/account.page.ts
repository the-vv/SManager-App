import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CashService } from 'src/app/services/cash.service';
import { ConfigService } from 'src/app/services/config.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  constructor(
    public config: ConfigService,
    public alertController: AlertController,
    public cashService: CashService,
    private user: UserService
  ) { }

  ngOnInit() {
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

  onLogout() {
    this.user.logout();
  }

}
