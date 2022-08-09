import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { CashService } from '../services/cash.service';
import { ConfigService } from '../services/config.service';
import { StorageService } from '../services/storage.service';
import { SplashScreen } from '@capacitor/splash-screen';

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
    private router: Router
  ) {
    this.cashService.setup(new Date());
    this.platform.backButton.subscribeWithPriority(11, async () => {
      if (!this.routerOutlet.canGoBack() && !this.config.preventAppClose) {
        await this.storage.setLastPage(this.router.url.slice(this.router.url.lastIndexOf('/') + 1));
        App.exitApp();
      }
    });
  }

  ionViewDidEnter() {
    SplashScreen.hide();
  }

  ngOnInit() {
  }

}
