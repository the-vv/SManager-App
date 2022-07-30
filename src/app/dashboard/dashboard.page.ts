import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { CashService } from '../services/cash.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(
    private cashService: CashService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet
  ) {
    this.cashService.setup(new Date());
    this.platform.backButton.subscribeWithPriority(11, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
  }

}
