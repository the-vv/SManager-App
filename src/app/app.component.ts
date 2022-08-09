import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { MenuController } from '@ionic/angular';
import { ConfigService } from './services/config.service';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private user: UserService,
    private router: Router,
    private menu: MenuController,
    private config: ConfigService,
    private storage: StorageService
  ) {
    this.user.getUser().then(async (userData) => {
      if (userData) {
        let routeToGo = '/dashboard/';
        if (userData.settings?.rememberLastPage) {
          const lastPage = await this.storage.getLastPage();
          if (lastPage?.length) {
            routeToGo += lastPage;
          } else if (userData.settings?.defaultPage?.length) {
            routeToGo += userData.settings?.defaultPage;
          }
        } else if (userData.settings?.defaultPage?.length) {
          routeToGo += userData.settings?.defaultPage;
        }
        await this.router.navigate([routeToGo], { replaceUrl: true });
      }
      else {
        console.log('no user');
        await this.router.navigate(['/home'], { replaceUrl: true });
        SplashScreen.hide();
      }
    })
      .catch(async (err) => {
        console.log(err);
        await this.router.navigate(['/home'], { replaceUrl: true });
        SplashScreen.hide();
      });
  }

  ionViewDidEnter() {
    // console.log('view');
    this.config.authEvents.subscribe(user => {
      // console.log(user);
      if (user) {
        this.menu.enable(true, 'main');
      } else {
        this.menu.enable(false, 'main');
      }
    });
  }
}
