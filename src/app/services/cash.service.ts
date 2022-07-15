import { Injectable } from '@angular/core';
// import { RealtimeSubscription } from '@supabase/supabase-js';
import { endOfMonth, startOfMonth } from 'date-fns';
import { ECashType, IIncomeExpense, IMonthWise } from '../models/common';
import { CommonService } from './common.service';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  allIncomes: IIncomeExpense[] = [];
  allExpenses: IIncomeExpense[] = [];
  currentMonthData: IMonthWise;
  // changeSubscription: RealtimeSubscription;

  constructor(
    private storageService: StorageService,
    private supabase: SupabaseService,
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
    console.log(this.allExpenses);
    this.addToCloud(expense);
  }

  addIncome(income: IIncomeExpense) {
    console.log(this.allIncomes);
    this.addToCloud(income);
  }

  addToCloud(item: IIncomeExpense) {
    this.config.cloudSyncing.next(true);
    this.supabase.addIncomeExpense(item)
      .then(res => {
        console.log(res);
        item.synced = true;
        this.storageService.updateOne(item);
        this.config.cloudSyncing.next(false);
      })
      .catch(err => {
        console.log(err);
        this.config.cloudSyncing.next(false);
      });
  }

  setup(timestamp: Date) {
    this.commonService.showSpinner();
    const start = startOfMonth(timestamp).toISOString();
    const end = endOfMonth(timestamp).toISOString();
    console.log(start, end);
    this.supabase.getAllIncomeExpenses(start, end)
      .then((res: any) => {
        const data = res.body as IIncomeExpense[];
        this.currentMonthData = {
          month: startOfMonth(timestamp).toLocaleDateString(undefined, { month: 'long' }),
          year: startOfMonth(timestamp).getFullYear(),
          totalExpense: 0,
          totalIncome: 0
        };
        data.forEach(this.updateMonthWise.bind(this));
        // if (this.changeSubscription) {
        //   this.changeSubscription.unsubscribe();
        // }
        // this.changeSubscription = this.supabase.onIncomeExpenseChange(this.onChangeItem.bind(this));
        this.commonService.hideSpinner();
      }).catch(err => {
        console.log(err);
        this.commonService.hideSpinner();
      });
  }

  updateMonthWise(item: IIncomeExpense) {
    if (item.type === ECashType.income) {
      this.allIncomes.push(item);
      this.currentMonthData.totalIncome += item.amount;
    } else {
      this.allExpenses.push(item);
      this.currentMonthData.totalExpense += item.amount;
    }
  }

  onChangeItem(payload: any) {
    console.log(payload);
    const operation = payload.eventType;
    const item = payload.new as IIncomeExpense;
    if (this.currentMonthData.month === new Date(item.datetime).toLocaleDateString(undefined, { month: 'long' }) &&
      this.currentMonthData.year === new Date(item.datetime).getFullYear()) {
      if (operation === 'INSERT') {
        this.updateMonthWise(item);
      }
    }
  }

  clearAll() {
    this.allExpenses = [];
    this.allIncomes = [];
    this.currentMonthData = undefined;
    this.storageService.deleteAll();
  }

}
