import { Injectable } from '@angular/core';
import { IncomeExpense, MonthWise } from '../models/common';
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
    private storageService: StorageService
  ) { }

  addExpense(expense: IncomeExpense) {
    this.allExpenses.unshift(expense);
    console.log(this.allExpenses);
  }

  addIncome(income: IncomeExpense) {
    this.allIncomes.unshift(income);
    console.log(this.allIncomes);
    this.addMonthWise(income);
  }

  addMonthWise(item: IncomeExpense) {
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
    }
    console.log(this.allMonthWise);
    this.storageService.addOne(item)
      .then(res => {
        console.log(res);
        this.storageService.getAll().then(console.log);
      });
  }

}
