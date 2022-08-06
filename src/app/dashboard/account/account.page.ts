import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { IAccount, IIncomeExpenseDB } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';
import { ConnectivityService } from 'src/app/services/connectivity.service';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  public allAccounts: IAccount[] = [];
  private subs: Subscription = new Subscription();

  constructor(
    public config: ConfigService,
    public alertController: AlertController,
    public cashService: CashService,
    private user: UserService,
    private firebase: FirebaseService,
    private common: CommonService,
    public connectivity: ConnectivityService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.subs.add(
      this.firebase.getUserAccounts().subscribe((accounts) => {
        this.allAccounts = accounts;
        this.config.currentUserAccounts = accounts;
        console.log(this.allAccounts);
      })
    );
  }

  ionViewDidLeave() {
    this.subs.unsubscribe();
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
        this.common.showSpinner();
        if (this.config.currentUserAccounts.length === 0) {
          this.firebase.getAllUserIncomeExpenseItems().pipe(take(1)).subscribe(async (items) => {
            if (items.length > 0) {
              this.common.hideSpinner();
              const confirmAlert = await this.alertController.create({
                header: 'Info!',
                message: 'Creating first account will map all your incomes and expenses to this account.',
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                  }, {
                    text: 'Continue',
                    handler: () => {
                      this.common.hideSpinner();
                      this.createAccountAndMap(accountName, items);
                    }
                  }
                ]
              });
              await confirmAlert.present();
              confirmAlert.onWillDismiss().then(() => {
                this.common.hideSpinner();
              });
            } else {
              this.firebase.createAccount(accountName).then(() => {
                this.common.hideSpinner();
                this.common.showToast('Account created successfully');
              }).catch(() => {
                this.common.hideSpinner();
                this.common.showToast('Account creation failed');
              });
            }
          });
        } else {
          this.firebase.createAccount(accountName).then(() => {
            this.common.hideSpinner();
            this.common.showToast('Account created successfully');
          }).catch(() => {
            this.common.showToast('Account creation failed');
            this.common.hideSpinner();
          });;
        }
      }
    });
  }

  async createAccountAndMap(name: string, items: IIncomeExpenseDB[]) {
    await this.common.showSpinner('Creating Account...\nDon\'t Close The App');
    this.config.preventAppClose = true;
    this.firebase.createAccount(name).then((accountRef: any) => {
      this.common.hideSpinner();
      this.common.showSpinner('Mapping Items...');
      items.forEach(item => {
        item.accountId = accountRef.id;
      });
      this.firebase.updateMultipleIncomeExpenseItems(items).then(() => {
        this.common.hideSpinner();
        this.config.preventAppClose = false;
        this.common.showToast('Account created successfully');
        this.cashService.setup(new Date());
      }).catch(() => {
        this.config.preventAppClose = false;
        this.common.hideSpinner();
        this.common.showToast('Account creation failed');
      });
    }).catch(() => {
      this.config.preventAppClose = false;
      this.common.hideSpinner();
      this.common.showToast('Account creation failed');
    });
  }

  onLogout() {
    this.user.logout();
  }

}
