import { Component } from '@angular/core';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    public user: UserService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }
  logout() {
    this.user.logout();
  }
}
