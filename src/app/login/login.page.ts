import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User } from '../models/user';
import { CashService } from '../services/cash.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isLoading = false;
  errorMessages = '';
  loader: HTMLIonLoadingElement;
  showPassword = false;
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  constructor(
    private formBuilder: FormBuilder,
    public user: UserService,
    private router: Router,
    private common: CommonService,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private cashService: CashService
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
  onLogin() {
    if (this.loginForm.valid) {
      this.common.showSpinner();
      this.user.login(this.loginForm.value)
        .subscribe(res => {
          this.common.hideSpinner();
          if (res) {
            this.router.navigate(['dashboard'], { replaceUrl: true });
          }
        }, err => {
          this.errorMessages = err.error.status;
          this.common.hideSpinner();
        });
    }
  }
  get f() {
    return this.loginForm?.controls;
  }

  async gLogin() {
    this.common.showSpinner();
    GoogleAuth.signIn().then((res: any) => {
      console.log(res);
      const { name, email, displayName, imageUrl } = res;
      this.user.gLoginSetupUser({ name: name ? name : displayName, email, imageUrl } as User)
        .subscribe(ures => {
          this.common.hideSpinner();
          if (res) {
            this.router.navigate(['dashboard'], { replaceUrl: true });
            this.cashService.setup();
          }
        }, err => {
          this.common.hideSpinner();
          this.errorMessages = err.error.status ? err.error.status : 'Something went wrong, Please try again later';
        });
    }).catch(err => {
      this.common.hideSpinner();
      this.errorMessages = err.error.status ? err.error.status : 'Something went wrong, Please try again later';
    });
  }
}
