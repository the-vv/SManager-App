import { Component, OnInit } from '@angular/core';
import { CashService } from 'src/app/services/cash.service';

@Component({
  selector: 'app-income',
  templateUrl: './income.page.html',
  styleUrls: ['./income.page.scss'],
})
export class IncomePage implements OnInit {

  constructor(
    public cashService: CashService
  ) { }

  ngOnInit() {
  }

}
