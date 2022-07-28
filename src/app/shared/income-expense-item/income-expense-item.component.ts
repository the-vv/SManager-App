import { Component, Input, OnInit } from '@angular/core';
import { ECashType, IIncomeExpense } from 'src/app/models/common';

@Component({
  selector: 'app-income-expense-item',
  templateUrl: './income-expense-item.component.html',
  styleUrls: ['./income-expense-item.component.scss'],
})
export class IncomeExpenseItemComponent implements OnInit {

  @Input() item: IIncomeExpense;
  eCashType = ECashType;
  constructor() { }

  ngOnInit() {}

}
