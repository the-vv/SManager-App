import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { CashService } from '../services/cash.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(
    private cashService: CashService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private config: ConfigService
  ) {
    this.cashService.setup(new Date());
    this.platform.backButton.subscribeWithPriority(11, () => {
      if (!this.routerOutlet.canGoBack() && !this.config.preventAppClose) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
  }

}
