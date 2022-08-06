import { Injectable } from '@angular/core';
// import { RealtimeSubscription } from '@supabase/supabase-js';
import { endOfMonth, startOfMonth } from 'date-fns';
import { ECashType, EFirebaseActionTypes, FTimeStamp, IIncomeExpense, IIncomeExpenseDB, IMonthWise } from '../models/common';
import { CommonService } from './common.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  allIncomes: IIncomeExpense[] = [];
  allExpenses: IIncomeExpense[] = [];
  currentMonthData: IMonthWise;
  changeSubscription: Subscription;
  onIncomeExpenseChange$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

  constructor(
    private storageService: StorageService,
    private supabase: FirebaseService,
    private config: ConfigService,
    private commonService: CommonService
  ) {
    this.config.authEvents.subscribe(user => {
      if (!user) {
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
    this.supabase.addIncomeExpense(item)
      .then(async (res) => {
        console.log(res);
        item.synced = true;
        await this.storageService.updateOne(item);
        this.config.cloudSyncing.next(false);
      })
      .catch(err => {
        console.log(err);
        this.config.cloudSyncing.next(false);
      });
  }

  updateToCloud(item: IIncomeExpense, id: string) {
    this.config.cloudSyncing.next(true);
    this.supabase.updateIncomeExpense(item, id)
      .then(async (res) => {
        console.log(res);
        item.synced = true;
        await this.storageService.updateOne(item);
        this.config.cloudSyncing.next(false);
      })
      .catch(err => {
        console.log(err);
        this.config.cloudSyncing.next(false);
      });
  }

  setup(timestamp: Date) {
    this.commonService.showSpinner();
    this.clearAll();
    const start = startOfMonth(timestamp);
    const end = endOfMonth(timestamp);
    this.supabase.getAllIncomeExpenses(start, end)
      .then((res: any) => {
        const data = res as IIncomeExpense[];
        this.currentMonthData = {
          month: startOfMonth(timestamp).toLocaleDateString(undefined, { month: 'long' }),
          year: startOfMonth(timestamp).getFullYear(),
          totalExpense: 0,
          totalIncome: 0
        };
        data.forEach(this.updateMonthWise.bind(this));
        this.onIncomeExpenseChange$.next();
        if (this.changeSubscription) {
          this.changeSubscription.unsubscribe();
        }
        this.changeSubscription = this.supabase.onIncomeExpenseChange(this.onChangeItem.bind(this));
        this.commonService.hideSpinner();
      }).catch(err => {
        console.log(err);
        this.commonService.hideSpinner();
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
    console.log(operation);
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
      this.onIncomeExpenseChange$.next();
    }
  }

  clearAll() {
    this.allExpenses = [];
    this.allIncomes = [];
    this.currentMonthData = undefined;
    this.storageService.deleteAll();
  }

  checkAlreadyExisting(item: IIncomeExpense | IIncomeExpenseDB) {
    if (item.type === ECashType.income) {
      return this.allIncomes.find(i => i.id === item.id);
    } else {
      return this.allExpenses.find(i => i.id === item.id);
    }
  }

}
