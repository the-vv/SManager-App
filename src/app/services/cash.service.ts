import { Injectable } from '@angular/core';
import {
  addDays, addMonths, addWeeks, addYears, differenceInDays, differenceInMonths,
  differenceInWeeks, differenceInYears, endOfMonth, startOfMonth, subMonths
} from 'date-fns';
import {
  EAutomationFrequency, ECashType, EFirebaseActionTypes, FTimeStamp,
  IAccount, IAutomation, IIncomeExpense, IIncomeExpenseDB, IMonthWise
} from '../models/common';
import { CommonService } from './common.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, firstValueFrom, Subscription, take } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { ConnectivityService } from './connectivity.service';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  allIncomes: IIncomeExpense[] = [];
  allExpenses: IIncomeExpense[] = [];
  currentMonthData: IMonthWise;
  changeSubscription: Subscription;
  onIncomeExpenseChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private storageService: StorageService,
    private firebase: FirebaseService,
    private config: ConfigService,
    private commonService: CommonService,
    private router: Router,
    private user: UserService,
    private connectivity: ConnectivityService
  ) {
    this.config.authEvents.subscribe(userRes => {
      if (!userRes) {
        this.clearAll();
      }
    });
  }

  addExpense(expense: IIncomeExpense) {
    // console.log(this.allExpenses);
    this.addToCloud(expense);
  }

  addIncome(income: IIncomeExpense) {
    // console.log(this.allIncomes);
    this.addToCloud(income);
  }

  updateItem(item: IIncomeExpense, id: string) {
    this.updateToCloud(item, id);
  }

  addToCloud(item: IIncomeExpense) {
    this.config.cloudSyncing.next(true);
    this.firebase.addIncomeExpense(item)
      .then(async (res) => {
        console.log(res);
        item.synced = true;
        this.config.cloudSyncing.next(false);
      })
      .catch(err => {
        console.log(err);
        this.config.cloudSyncing.next(false);
      });
  }

  updateToCloud(item: IIncomeExpense, id: string) {
    this.config.cloudSyncing.next(true);
    this.firebase.updateIncomeExpense(item, id)
      .then(async (res) => {
        item.synced = true;
        this.config.cloudSyncing.next(false);
      })
      .catch(err => {
        console.log(err);
        this.config.cloudSyncing.next(false);
      });
  }

  setup(timestamp: Date, checkAutomation: boolean = false) {
    if (!this.connectivity.isOnline) {
      this.commonService.showToast('You are offline. Please connect to internet');
      return;
    }
    this.commonService.showSpinner();
    this.clearAll();
    this.firebase.getUserAccounts().pipe(take(1)).subscribe(async (accounts) => {
      if (!accounts?.length) {
        this.commonService.hideSpinner();
        this.commonService.alertCtrl.create({
          header: 'No Bank Accounts',
          message: 'You have no bank accounts. Please add an account to continue.',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            }, {
              text: 'Add',
              handler: () => {
                this.router.navigate(['/dashboard/account']);
              }
            }
          ]
        }).then(alert => {
          alert.present();
        });
        return;
      }
      this.config.currentUserAccounts = accounts;
      let defaultAccountId = await this.storageService.getDefaultAccount();
      if (!defaultAccountId || !accounts.find(a => a.id === defaultAccountId)) {
        this.storageService.setDefaultAccount(accounts[0].id);
        defaultAccountId = null;
      }
      this.config.currentAccountId = defaultAccountId?.length ? defaultAccountId : accounts[0].id;
      const start = startOfMonth(timestamp);
      const end = endOfMonth(timestamp);
      this.firebase.getAllIncomeExpenses(start, end, this.config.currentAccountId)
        .pipe(take(1)).subscribe({
          next: (res: any) => {
            const data = res as IIncomeExpense[];
            this.currentMonthData = {
              month: startOfMonth(timestamp).toLocaleDateString(undefined, { month: 'long' }),
              year: startOfMonth(timestamp).getFullYear(),
              totalExpense: 0,
              totalIncome: 0
            };
            data.forEach(this.updateMonthWise.bind(this));
            this.onIncomeExpenseChange$.next(true);
            if (this.changeSubscription) {
              this.changeSubscription.unsubscribe();
            }
            this.changeSubscription = this.firebase.onIncomeExpenseChange(this.onChangeItem.bind(this));
            this.commonService.hideSpinner();
            if (checkAutomation) {
              this.checkAutomations();
            }
          },
          error: err => {
            console.log(err);
            this.commonService.hideSpinner();
          }
        });
    });
  }

  updateMonthWise(item: IIncomeExpenseDB) {
    item.datetime = (item.datetime as FTimeStamp).toDate();
    const newItem = { ...item } as IIncomeExpense;
    if (newItem.type === ECashType.income) {
      this.allIncomes.push(newItem);
      this.currentMonthData.totalIncome += newItem.amount;
      this.allIncomes.sort((a, b) => (
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      ));
    } else {
      this.allExpenses.push(newItem);
      this.currentMonthData.totalExpense += newItem.amount;
      this.allExpenses.sort((a, b) => (
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      ));
    }
  }

  onChangeItem(payload: any) {
    if (payload.length > 1 || payload.length === 0) {
      return;
    }
    const operation = payload[0].type;
    const item = payload[0].data as IIncomeExpenseDB;
    if (this.currentMonthData.month === new Date((item.datetime as FTimeStamp).toDate()).toLocaleDateString(undefined, { month: 'long' }) &&
      this.currentMonthData.year === new Date((item.datetime as FTimeStamp).toDate()).getFullYear()) {
      if (operation === EFirebaseActionTypes.added && !this.checkAlreadyExisting(item)) {
        this.updateMonthWise(item);
      } else if (operation === EFirebaseActionTypes.removed) {
        if (item.type === ECashType.income) {
          this.allIncomes = this.allIncomes.filter(i => i.id !== item.id);
          this.currentMonthData.totalIncome -= item.amount;
        } else {
          this.allExpenses = this.allExpenses.filter(i => i.id !== item.id);
          this.currentMonthData.totalExpense -= item.amount;
        }
      } else if (operation === EFirebaseActionTypes.modified) {
        item.datetime = (item.datetime as FTimeStamp).toDate();
        if (item.type === ECashType.income) {
          this.allIncomes = this.allIncomes.map(i => {
            if (i.id === item.id) {
              this.currentMonthData.totalIncome -= i.amount;
              this.currentMonthData.totalIncome += item.amount;
              return item as IIncomeExpense;
            }
            return i;
          });
        } else {
          this.allExpenses = this.allExpenses.map(i => {
            if (i.id === item.id) {
              this.currentMonthData.totalExpense -= i.amount;
              this.currentMonthData.totalExpense += item.amount;
              return item as IIncomeExpense;
            }
            return i;
          });
        }
      }
      this.onIncomeExpenseChange$.next(true);
    }
  }

  clearAll() {
    this.allExpenses = [];
    this.allIncomes = [];
    this.currentMonthData = undefined;
    // this.storageService.deleteAll();
  }

  checkAlreadyExisting(item: IIncomeExpense | IIncomeExpenseDB) {
    if (item.type === ECashType.income) {
      return this.allIncomes.find(i => i.id === item.id);
    } else {
      return this.allExpenses.find(i => i.id === item.id);
    }
  }

  async checkAutomations() {
    const updatedUser = await firstValueFrom(this.firebase.getCurrentUser());
    if (updatedUser?.settings?.lastUsedTime) {
      updatedUser.settings.lastUsedTime = (updatedUser.settings?.lastUsedTime as FTimeStamp).toDate();
      this.user.setUser(updatedUser);
    }
    if (updatedUser?.settings?.addLastMonthBalance) {
      const lastUsedTime = new Date(updatedUser?.settings?.lastUsedTime as Date);
      console.log(lastUsedTime);
      if (lastUsedTime && !isNaN(+lastUsedTime) && startOfMonth(new Date()) > new Date(lastUsedTime)) {
        this.firebase.getUserAccounts().pipe(take(1)).subscribe({
          next: (accounts: IAccount[]) => {
            const itemsToAdd: IIncomeExpense[] = [];
            const allAccountLastMonthBalance: Promise<{ accountId: string; amount: number }>[] = [];
            accounts.forEach(async (account) => {
              allAccountLastMonthBalance.push(this.getLastMonthBalance(account.id));
            });
            Promise.all(allAccountLastMonthBalance).then((res) => {
              res.forEach(item => {
                if (item.amount > 0) {
                  itemsToAdd.push({
                    amount: item.amount,
                    categoryId: '',
                    datetime: startOfMonth(new Date()),
                    description: 'Automated carry forward of last month balance',
                    type: ECashType.income,
                    accountId: item.accountId,
                    title: 'Last Month Balance',
                    userId: this.config.currentUser.id,
                  });
                }
              });
              if (itemsToAdd.length > 0) {
                this.firebase.addMultipleIncomeExpenseItems(itemsToAdd)
                  .then(() => {
                    this.commonService.showToast('Successfully added last month balance');
                    this.storageService.setLastUsedTime(this.commonService.toLocaleIsoDateString(new Date()));
                  }).catch(err => {
                    console.log(err);
                    this.commonService.showToast('Error while carry forwarding last month balance');
                  });
              }
            }).catch(err => {
              console.log(err);
              this.commonService.showToast('Error while carry forwarding last month balance');
            });
          },
          error: err => {
            console.log(err);
            this.commonService.showToast('Error while carry forwarding last month balance');
          }
        });
      }
      this.user.updateLastUsedTime();
    }
    const allUserAutomations = await firstValueFrom(this.firebase.getAllUserAutomations());
    if (allUserAutomations?.length) {
      const allItemsToAdd: IIncomeExpense[] = [];
      const automationsToUpdate = new Map<string, Date>();
      allUserAutomations.forEach(async (automation) => {
        if (!automation.active) {
          return;
        }
        if (automation.lastExecuted === null) {
          const datetime = (automation.datetime as FTimeStamp).toDate();
          if (datetime && new Date() > new Date(datetime)) {
            allItemsToAdd.push({
              amount: automation.amount,
              categoryId: automation.categoryId ?? '',
              datetime,
              description: automation.description,
              type: automation.type,
              accountId: automation.accountId,
              title: automation.title,
              userId: this.config.currentUser.id,
            });
            automationsToUpdate.set(automation.id, datetime);
            const countToExecute = this.checkIfExecuteAutomationByFrequency(automation.datetime as FTimeStamp, automation.frequency);
            // here starting from 0 because we have to create item at datetime
            for (let i = 1; i <= countToExecute; i++) {
              const datetimeChange = this.getFrequencyRepeatCorrespondingDate(automation, i, automation.datetime as FTimeStamp);
              allItemsToAdd.push({
                amount: automation.amount,
                categoryId: automation.categoryId ?? '',
                datetime: datetimeChange,
                description: automation.description,
                type: automation.type,
                accountId: automation.accountId,
                title: automation.title,
                userId: this.config.currentUser.id,
              });
              automationsToUpdate.set(automation.id, datetimeChange);
            }
          }
        } else {
          const countToExecute = this.checkIfExecuteAutomationByFrequency(automation.lastExecuted as FTimeStamp, automation.frequency);
          if (countToExecute > 0) {
            // here starting from 1 because we have to create item on next ocurance of datetime
            for (let i = 1; i <= countToExecute; i++) {
              const datetime = this.getFrequencyRepeatCorrespondingDate(automation, i);
              allItemsToAdd.push({
                amount: automation.amount,
                categoryId: automation.categoryId ?? '',
                datetime,
                description: automation.description,
                type: automation.type,
                accountId: automation.accountId,
                title: automation.title,
                userId: this.config.currentUser.id,
              });
              automationsToUpdate.set(automation.id, datetime);
            }
          }
        }
      });
      if (allItemsToAdd.length > 0) {
        this.firebase.addMultipleIncomeExpenseItems(allItemsToAdd)
          .then(() => {
            this.commonService.showToast('Successfully added automation items');
            this.storageService.setLastUsedTime(this.commonService.toLocaleIsoDateString(new Date()));
          }).catch(err => {
            console.log(err);
            this.commonService.showToast('Error while adding automation items');
          });
      }
      if (automationsToUpdate.size > 0) {
        this.firebase.updateMultipleAutomationsExecutedTime(automationsToUpdate)
          .then(() => {
            this.commonService.showToast('Successfully updated automation items');
            this.storageService.setLastUsedTime(this.commonService.toLocaleIsoDateString(new Date()));
          }).catch(err => {
            console.log(err);
            this.commonService.showToast('Error while updating automation items');
          });
      }
    }
  }

  getLastMonthBalance(accountId: string) {
    return new Promise<{ accountId: string; amount: number }>((resolve, reject) => {
      const lastMonth = subMonths(new Date(), 1);
      const start = startOfMonth(lastMonth);
      const end = endOfMonth(lastMonth);
      return this.firebase.getAllIncomeExpenses(start, end, accountId)
        .pipe(take(1)).subscribe({
          next: (res: any) => {
            const data = res as IIncomeExpense[];
            let total = 0;
            data.forEach(item => {
              if (item.type === ECashType.income) {
                total += item.amount;
              } else {
                total -= item.amount;
              }
            });
            resolve({ accountId, amount: total });
          },
          error: err => {
            reject(err);
          }
        });
    });
  }

  getFrequencyRepeatCorrespondingDate(automation: IAutomation, count: number, dateToCheck?: FTimeStamp) {
    const itemDate = dateToCheck?.toDate() ?? (automation.lastExecuted as FTimeStamp).toDate();
    switch (automation.frequency) {
      case EAutomationFrequency.daily: {
        return addDays(itemDate, count);
      }
      case EAutomationFrequency.weekly: {
        return addWeeks(itemDate, count);
      }
      case EAutomationFrequency.monthly: {
        return addMonths(itemDate, count);
      }
      case EAutomationFrequency.yearly: {
        return addYears(itemDate, count);
      }
    }
  }

  checkIfExecuteAutomationByFrequency(timeToCheck: FTimeStamp, frequency: EAutomationFrequency): number {
    const lastExecuted = timeToCheck.toDate();
    switch (frequency) {
      case EAutomationFrequency.daily: {
        const difference = differenceInDays(new Date(), lastExecuted);
        return difference;
      }
      case EAutomationFrequency.weekly: {
        const difference = differenceInWeeks(new Date(), lastExecuted);
        return difference;
      }
      case EAutomationFrequency.monthly: {
        const difference = differenceInMonths(new Date(), lastExecuted);
        return difference;
      }
      case EAutomationFrequency.yearly: {
        const difference = differenceInYears(new Date(), lastExecuted);
        return difference;
      }
    }
  }

}
