import { Component, OnInit } from '@angular/core';
import { CashService } from '../services/cash.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(private cashService: CashService) {
    this.cashService.setup(new Date());
  }

  ngOnInit() {
  }

}
