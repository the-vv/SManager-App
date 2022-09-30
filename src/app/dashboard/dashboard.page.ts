import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { CashService } from '../services/cash.service';
import { ConfigService } from '../services/config.service';
import { StorageService } from '../services/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { CommonService } from '../services/common.service';

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
    private config: ConfigService,
    private storage: StorageService,
    private router: Router,
    private common: CommonService
  ) {
    this.cashService.setup(new Date(), true);
    this.platform.backButton.subscribeWithPriority(11, async () => {
      if (!this.routerOutlet.canGoBack() && !this.config.preventAppClose) {
        await this.storage.setLastPage(this.router.url.slice(this.router.url.lastIndexOf('/') + 1));
        await this.storage.setLastUsedTime(this.common.toLocaleIsoDateString(new Date()));
        App.exitApp();
      }
    });
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        this.storage.setLastUsedTime(this.common.toLocaleIsoDateString(new Date()));
      } else {
        this.cashService.checkAutomations();
      }
    });
  }

  ionViewDidEnter() {
    SplashScreen.hide();
    // console.log(App.getInfo());
  }

  ngOnInit() {
  }

}
