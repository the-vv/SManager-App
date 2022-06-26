import { Component, OnInit } from '@angular/core';
import { ECashType } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
})
export class ExpensePage implements OnInit {

  public cashType = ECashType;

  constructor(
    public cashService: CashService
  ) { }

  ngOnInit() {
  }

}
