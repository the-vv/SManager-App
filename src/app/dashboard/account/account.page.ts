import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription, take } from 'rxjs';
import { EPageTypes, IAccount, IIncomeExpenseDB } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UserService } from 'src/app/services/user.service';
import { ConnectivityService } from 'src/app/services/connectivity.service';
import { StorageService } from 'src/app/services/storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IUser } from 'src/app/models/user';
import { Router } from '@angular/router';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  public allAccounts: IAccount[] = [];
  public currentAccount: string;
  public settingsForm: FormGroup = new FormGroup({
    addLastMonthBalance: new FormControl(false),
    defaultPage: new FormControl(EPageTypes.overview),
    rememberLastPage: new FormControl(false),
  });
  public allPages = Object.values(EPageTypes);
  public savingSettings = false;
  private subs: Subscription = new Subscription();

  constructor(
    public config: ConfigService,
    public alertController: AlertController,
    public cashService: CashService,
    private user: UserService,
    private firebase: FirebaseService,
    private common: CommonService,
    public connectivity: ConnectivityService,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    if (this.config.currentUser.settings) {
      this.settingsForm.patchValue(this.config.currentUser.settings);
    }
    if (this.subs) {
      this.subs.unsubscribe();
    }
    this.subs = this.firebase.getUserAccounts().subscribe({
      next: (accounts) => {
        this.allAccounts = accounts;
        this.config.currentUserAccounts = accounts;
      },
      error: err => {
        console.log(err);
      }
    });
    this.currentAccount = this.config.currentAccountId;
    this.storage.setLastPage(this.router.url.slice(this.router.url.lastIndexOf('/') + 1));
  }

  ionViewDidLeave() {
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
      const accountName = value?.data?.values?.[0];
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
                      this.createAccountAndMap(accountName, items);
                    }
                  }
                ]
              });
              await confirmAlert.present();
            } else {
              this.firebase.createAccount(accountName).then((accountRef: any) => {
                this.common.showToast('Account created successfully');
                this.cashService.setup(new Date());
                this.common.hideSpinner();
                this.firebase.getUserAccounts().pipe(take(1)).subscribe((accounts) => {
                  this.allAccounts = accounts;
                  this.config.currentUserAccounts = accounts;
                  this.config.currentAccountId = accountRef.id;
                  this.currentAccount = this.config.currentAccountId;
                  this.storage.setDefaultAccount(accountRef.id);
                });
              }).catch((err) => {
                console.log(err);
                this.common.showToast('Account creation failed');
                this.common.hideSpinner();
              });
            }
          });
        } else {
          this.firebase.createAccount(accountName).then(() => {
            this.firebase.getUserAccounts().pipe(take(1)).subscribe((accounts) => {
              this.allAccounts = accounts;
              this.config.currentUserAccounts = accounts;
            });
            this.common.hideSpinner();
            this.common.showToast('Account created successfully');
          }).catch((err) => {
            console.log(err);
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
    this.firebase.createAccount(name).then(async (accountRef: any) => {
      await this.common.hideSpinner();
      this.currentAccount = accountRef.id;
      await this.common.showSpinner('Mapping Items...');
      items.forEach(item => {
        item.accountId = accountRef.id;
      });
      this.firebase.updateMultipleIncomeExpenseItems(items).then(() => {
        this.config.preventAppClose = false;
        this.common.showToast('Account created and mapped successfully');
        this.cashService.setup(new Date());
        this.firebase.getUserAccounts().pipe(take(1)).subscribe((accounts) => {
          this.allAccounts = accounts;
          this.config.currentUserAccounts = accounts;
          this.config.currentAccountId = accountRef.id;
          this.currentAccount = this.config.currentAccountId;
        });
        this.common.hideSpinner();
      }).catch((err) => {
        this.config.preventAppClose = false;
        console.log(err);
        this.common.showToast('mapping failed');
        this.common.hideSpinner();
      });
    }).catch((err) => {
      this.config.preventAppClose = false;
      console.log(err);
      this.common.showToast('Account creation failed');
      this.common.hideSpinner();
    });
  }

  async onChangeAccount(accountId: string) {
    if (accountId === this.config.currentAccountId) {
      return;
    }
    this.config.currentAccountId = accountId;
    await this.storage.setDefaultAccount(accountId);
    this.cashService.setup(new Date());
    this.currentAccount = accountId;
  }

  onLogout() {
    // show confirmation dialog
    this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Logout',
          handler: () => {
            this.user.logout();
          },
        }
      ]
    }).then(alert => alert.present());
  }

  async onEditAccount(account: IAccount) {
    const alert = await this.alertController.create({
      header: 'Please enter your account info',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Update',
          role: 'update',
        }
      ],
      inputs: [
        {
          placeholder: 'Account Name',
          label: 'Account Name',
          value: account.name,
          attributes: {
            autocapitalize: true,
          }
        }
      ],
    });
    await alert.present();
    alert.onDidDismiss().then((value) => {
      const accName = value?.data?.values?.[0];
      if (accName && value?.role === 'update') {
        this.config.cloudSyncing.next(true);
        account.name = accName;
        this.firebase.updateAccount(account)
          .then(() => {
            this.config.cloudSyncing.next(false);
            this.common.showToast('Accocunt updated successfully');
          }).catch(err => {
            this.config.cloudSyncing.next(false);
            console.log(err);
            this.common.showToast('Error updating accocunt');
          });
      }
    });
  }

  async onDeleteAccount(account: IAccount) {
    if (this.allAccounts.length === 1) {
      this.common.showToast('You must have at least one account');
      return;
    }
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete this account?<br>All your incomes and expenses of this account will be deleted!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Delete',
          handler: () => {
            this.common.showSpinner('Deleting Account...');
            this.firebase.deleteAccount(account.id)
              .then(async () => {
                if (this.config.currentAccountId === account.id) {
                  this.config.currentAccountId = this.allAccounts[0].id;
                  await this.storage.setDefaultAccount(this.config.currentAccountId);
                  this.currentAccount = this.config.currentAccountId;
                  this.cashService.setup(new Date());
                }
                this.common.hideSpinner();
                this.config.cloudSyncing.next(false);
                this.common.showToast('Account deleted successfully');
              }).catch(err => {
                this.common.hideSpinner();
                this.config.cloudSyncing.next(false);
                console.log(err);
                this.common.showToast('Error deleting account');
              });
          }
        }
      ]
    });
    await alert.present();
  }

  onSubmitSettings() {
    this.savingSettings = true;
    this.firebase.updateUserSettings(this.settingsForm.value)
      .then(() => {
        this.savingSettings = false;
        const newUser: IUser = {
          ...this.config.currentUser,
          settings: this.settingsForm.value
        };
        this.user.setUser(newUser);
        this.common.showToast('Settings updated successfully');
      }).catch(err => {
        this.savingSettings = false;
        console.log(err);
        this.common.showToast('Error updating settings');
      });
  }

}
