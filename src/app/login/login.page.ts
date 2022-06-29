import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { CashService } from '../services/cash.service';
import { SupabaseService } from '../services/supabase.service';
import { IUser } from '../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isLoading = false;
  errorMessages = '';
  loader: HTMLIonLoadingElement;
  constructor(
    public user: UserService,
    private router: Router,
    private common: CommonService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private cashService: CashService,
    private supabase: SupabaseService
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    if (this.platform.is('pwa') || this.platform.is('mobileweb')) {
      GoogleAuth.init();
      console.log('web');
    }
  }

  gLogin() {
    this.common.showSpinner();
    GoogleAuth.signIn().then((res: any) => {
      console.log(res);
      const { name, email, imageUrl } = res;
      const user: IUser = {
        name,
        email,
        imageUrl
      };
      this.supabase.saveUser(user).then((userRes: IUser) => {
        this.user.setUser(userRes);
        this.common.hideSpinner();
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      });
    }).catch(err => {
      this.common.hideSpinner();
      this.errorMessages = err.error?.status ? err.error.status : 'Something went wrong, Please try again later';
    });
  }
}
