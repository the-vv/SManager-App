import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private user: UserService,
    private router: Router) {
    this.user.getUser().then(u => {
      if (u) {
        this.router.navigate(['/home'], { replaceUrl: true });
        SplashScreen.hide();
      }
      else {
        this.router.navigate(['/login'], { replaceUrl: true });
        SplashScreen.hide();
      }
    })
      .catch(err => {
        this.router.navigate(['/login'], { replaceUrl: true });
        SplashScreen.hide();
      });
  }
}
