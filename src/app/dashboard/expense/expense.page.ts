import { Component, OnInit } from '@angular/core';
import { CashType } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
})
export class ExpensePage implements OnInit {

  public cashType = CashType;

  constructor(
    public cashService: CashService
  ) { }

  ngOnInit() {
  }

}
