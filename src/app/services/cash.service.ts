import { Injectable } from '@angular/core';
import { IncomeExpense } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  allIncomes: IncomeExpense[] = [];
  allExpenses: IncomeExpense[] = [];
  allSessions: unknown;

  constructor() { }
}
