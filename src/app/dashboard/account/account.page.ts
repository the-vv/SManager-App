import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { ECashType, EPageTypes, FTimeStamp, IAccount, IAutomation, ICategory, IIncomeExpenseDB } from 'src/app/models/common';
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
import { CreateSharedComponent } from 'src/app/shared/create-shared/create-shared.component';
import { DatePipe } from '@angular/common';


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
  public allAutomations: IAutomation[] = [];
  private subs: Subscription = new Subscription();
  private subs1: Subscription = new Subscription();
  private allCategories: ICategory[] = [];

  constructor(
    public config: ConfigService,
    public alertController: AlertController,
    public cashService: CashService,
    private user: UserService,
    private firebase: FirebaseService,
    private common: CommonService,
    public connectivity: ConnectivityService,
    private storage: StorageService,
    private router: Router,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private alertCtrl: AlertController
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
    this.getUserAutomations();
    this.firebase.getAllUserCategories().pipe(take(1)).subscribe((categories) => {
      this.allCategories = categories;
    });
    if (this.subs1) {
      this.subs1.unsubscribe();
    }
    this.settingsForm.valueChanges.subscribe((val) => {
      this.onSubmitSettings();
    });
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
            this.common.showToast('Account updated successfully');
          }).catch(err => {
            this.config.cloudSyncing.next(false);
            console.log(err);
            this.common.showToast('Error updating account');
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
    this.config.cloudSyncing.next(true);
    this.firebase.updateUserSettings(this.settingsForm.getRawValue())
      .then(() => {
        const newUser: IUser = {
          ...this.config.currentUser,
          settings: this.settingsForm.getRawValue()
        };
        this.user.setUser(newUser);
      }).catch(err => {
        console.log(err);
        this.common.showToast('Error updating settings');
      }).finally(() => {
        this.config.cloudSyncing.next(false);
      });
  }

  async createAutomation() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an item',
      buttons: [{
        text: 'Income',
        icon: 'wallet-outline',
        handler: () => {
          this.createAutomationItem(ECashType.income);
        }
      }, {
        text: 'Expense',
        icon: 'cash-outline',
        handler: () => {
          this.createAutomationItem(ECashType.expense);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

  async createAutomationItem(type: ECashType) {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      componentProps: {
        type,
        isAutomation: true
      }
    });
    modal.onDidDismiss().then((data) => {
      this.getUserAutomations();
    });
    return await modal.present();
  }

  getUserAutomations() {
    firstValueFrom(this.firebase.getAllUserAutomations())
      .then(automations => {
        this.allAutomations = automations;
      }).catch(err => {
        console.log(err);
      });
  }

  async onDeleteAutomation(automation: IAutomation) {
    if (!(await this.common.showDeleteConfirmation(automation.title, 'Automation'))) {
      return;
    }
    this.common.showSpinner('Deleting Automation...');
    this.firebase.deleteAutomation(automation.id)
      .then(() => {
        this.common.hideSpinner();
        this.config.cloudSyncing.next(false);
        this.common.showToast('Automation deleted successfully');
      }).catch(err => {
        this.common.hideSpinner();
        this.config.cloudSyncing.next(false);
        console.log(err);
        this.common.showToast('Error deleting automation');
      }).finally(() => {
        this.getUserAutomations();
      });
  }

  async updateAutomationStatus(automation: IAutomation) {
    this.firebase.updateAutomationStatus(automation.id, !automation.active)
      .then(() => {
        this.config.cloudSyncing.next(false);
        this.getUserAutomations();
        this.common.showToast(`Automation ${automation.active ? 'disabled' : 'enabled'} successfully`);
      }).catch(err => {
        this.config.cloudSyncing.next(false);
        console.log(err);
        this.getUserAutomations();
        this.common.showToast('Error updating automation');
      });
  }

  showAutomationDetails(item: IAutomation) {
    const categoryName = this.allCategories.find(c => c.id === item.categoryId)?.name || 'Uncategorized';
    const accountName = this.allAccounts.find(a => a.id === item.accountId)?.name;
    const currentDateTime = (item.datetime as FTimeStamp).toDate();
    const lastDateTime = (item.lastExecuted as FTimeStamp)?.toDate();
    this.alertCtrl.create({
      header: `Automation: ${item.title}`,
      message: `<p class='text-${item.type === ECashType.expense ? 'danger' : 'success'} font-bold p-0 m-0 h5'>
        ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ₹ ${item.amount}</p>
        <div class='mt-0.5 block'><strong class=''>Category: </strong> ${categoryName}</div>        
        <div class='mt-0.5 block'><strong class=''>Frequency: </strong>
          ${item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
        </div>        
        ${lastDateTime ? `
        <div class='mt-0.5 block'><strong class=''>Last Executed: </strong>         
          ${new DatePipe('en').transform(lastDateTime, 'dd/M/yyyy hh:mm a')}
        </div>
        ` : ''}
        <div class='mt-0.5 block'><strong class=''>Date:</strong>
              ${new DatePipe('en').transform(currentDateTime, 'dd/M/yyyy hh:mm a')}
        </div>
        <div class='mt-0.5 block'><strong class=''>Account:</strong> ${accountName}</div>
        <div class='mt-0.5 block'><strong class=''>Description: </strong> ${item.description}</div>
      `,
      buttons: [{ text: 'Close' }]
    }).then(alert => alert.present());
  }

  async editAutomation(item: IAutomation) {
    const modal = await this.modalController.create({
      component: CreateSharedComponent,
      componentProps: {
        type: item.type,
        isAutomation: true,
        automationItem: item
      }
    });
    modal.onDidDismiss().then((data) => {
      this.getUserAutomations();
    });
    return await modal.present();
  }

}
