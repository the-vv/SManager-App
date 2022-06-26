import { Injectable } from '@angular/core';
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
  allMonthWise: IMonthWise[] = [];
  allSessions: unknown;

  constructor(
    private storageService: StorageService,
    private commonService: CommonService,
    private supabase: SupabaseService,
    private config: ConfigService
  ) { }

  addExpense(expense: IIncomeExpense) {
    this.allExpenses.unshift(expense);
    console.log(this.allExpenses);
    this.addMonthWise(expense);
    this.addToCloud(expense);
  }

  addIncome(income: IIncomeExpense) {
    this.allIncomes.unshift(income);
    console.log(this.allIncomes);
    this.addMonthWise(income);
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

  addMonthWise(item: IIncomeExpense, fromStorage: boolean = false, needSort: boolean = false) {
    const dateObj = new Date(item.datetime);
    const month = dateObj.toLocaleDateString(undefined, { month: 'long' });
    const year = dateObj.getFullYear();
    const monthObject = this.allMonthWise.find(el => el.month === month && el.year === year && el.type === item.type);
    if (monthObject) {
      monthObject.items.push(item);
      monthObject.total += item.amount;
    } else {
      const montObj: IMonthWise = {
        items: [item],
        month,
        year,
        total: item.amount,
        type: item.type
      };
      this.allMonthWise.push(montObj);
      this.sortMonthWise();
    }
    if (fromStorage) {
      this.sortMonthWise();
    } else {
      this.storageService.addOne(item)
        .then(res => {
          this.commonService.showToast(`Successfully added ${item.type === ECashType.income ? 'Income' : 'Expense'}`, 3000, true);
        }).catch(err => {
          this.commonService.showToast(
            `An error occured while adding an ${item.type === ECashType.income ? 'Income' : 'Expense'}`,
            3000, true);
        });
    }
  }

  setup() {
    this.storageService.storageEvents.subscribe(status => {
      if (status) {
        this.storageService.getAll().then(res => {
          this.allExpenses = [];
          this.allIncomes = [];
          this.allMonthWise = [];
          this.allSessions = [];
          res.forEach(el => {
            if (el.type === ECashType.expense) {
              this.allExpenses = [...this.allExpenses, el];
            } else {
              this.allIncomes = [...this.allIncomes, el];
            }
            this.addMonthWise(el, true);
          });
          console.log(this.allMonthWise);
        });
      }
    });
  }

  clearAll() {
    this.allExpenses = [];
    this.allIncomes = [];
    this.allMonthWise = [];
    this.allSessions = [];
    this.storageService.deleteAll();
  }

  sortMonthWise() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    this.allMonthWise.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      } else {
        return months.indexOf(b.month) - months.indexOf(a.month);
      };
    });
  }

}
