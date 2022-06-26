import { Injectable } from '@angular/core';
import { CashType, IncomeExpense, MonthWise } from '../models/common';
import { CommonService } from './common.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  allIncomes: IncomeExpense[] = [];
  allExpenses: IncomeExpense[] = [];
  allMonthWise: MonthWise[] = [];
  allSessions: unknown;

  constructor(
    private storageService: StorageService,
    private commonService: CommonService
  ) { }

  addExpense(expense: IncomeExpense) {
    this.allExpenses.unshift(expense);
    // console.log(this.allExpenses);
    this.addMonthWise(expense);
  }

  addIncome(income: IncomeExpense) {
    this.allIncomes.unshift(income);
    // console.log(this.allIncomes);
    this.addMonthWise(income);
  }

  addMonthWise(item: IncomeExpense, fromStorage: boolean = false, needSort: boolean = false) {
    const dateObj = new Date(item.datetime);
    const month = dateObj.toLocaleDateString(undefined, { month: 'long' });
    const year = dateObj.getFullYear();
    const monthObject = this.allMonthWise.find(el => el.month === month && el.year === year && el.type === item.type);
    if (monthObject) {
      monthObject.items.push(item);
      monthObject.total += item.amount;
    } else {
      const montObj: MonthWise = {
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
          this.commonService.showToast(`Successfully added ${item.type === CashType.income ? 'Income' : 'Expense'}`, 3000, true);
        }).catch(err => {
          this.commonService.showToast(
            `An error occured while adding an ${item.type === CashType.income ? 'Income' : 'Expense'}`,
            3000, true);
        });
    }
  }

  setup() {
    this.storageService.storageEvents.subscribe(status => {
      if (status) {
        this.storageService.getAll().then(res => {
          res.forEach(el => {
            if (el.type === CashType.expense) {
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
