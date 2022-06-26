import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { MenuController } from '@ionic/angular';
import { ConfigService } from './services/config.service';
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
    private config: ConfigService) {
    this.user.getUser().then(async (u) => {
      console.log(u);
      if (u) {
        await this.router.navigate(['/dashboard'], { replaceUrl: true });
        SplashScreen.hide();
      }
      else {
        await this.router.navigate(['/home'], { replaceUrl: true });
        SplashScreen.hide();
      }
    })
      .catch(async (err) => {
        await this.router.navigate(['/home'], { replaceUrl: true });
        SplashScreen.hide();
      });
  }

  ionViewDidEnter() {
    console.log('view');
    this.config.authEvents.subscribe(user => {
      console.log(user);
      if(user) {
        this.menu.enable(true, 'main');
      } else {
        this.menu.enable(false, 'main');
      }
    });
  }
}
