import { Component } from '@angular/core';
import { IonRouterOutlet, NavController, Platform } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    public user: UserService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private navCtrl: NavController,
    private router: Router) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('back button');
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      } else {
        this.navCtrl.back();
        console.log('back');
      }
    });
  }
  logout() {
    this.user.logout();
  }
}
