import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FirebaseService } from '../services/firebase.service';
import { IUser } from '../models/user';
import { environment } from 'src/environments/environment';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { StorageService } from '../services/storage.service';
import { FTimeStamp } from '../models/common';

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
    private firebase: FirebaseService,
    public auth: AngularFireAuth,
    private storage: StorageService
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      GoogleAuth.initialize({
        clientId: environment.googleClientid,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    });
    // console.log('web');
  }

  gLogin() {
    this.common.showSpinner();
    GoogleAuth.signIn().then((res: any) => {
      const credential = GoogleAuthProvider.credential(res.authentication.idToken, res.authentication.accessToken);
      this.auth.signInWithCredential(credential)
        .then(user => {
          const customUser: IUser = {
            name: user.user.displayName,
            email: user.user.email,
            imageUrl: user.user.photoURL,
            id: user.user.uid,
          };
          if (user.additionalUserInfo.isNewUser) {
            customUser.settings.lastUsedTime = new Date();
            customUser.settings.addLastMonthBalance = true;
          }
          this.firebase.saveUser(customUser).then(async (userRes: IUser) => {
            if (userRes.settings?.lastUsedTime) {
              userRes.settings.lastUsedTime = (userRes.settings?.lastUsedTime as FTimeStamp).toDate();
            }
            this.user.setUser(userRes);
            console.log(userRes);
            this.common.hideSpinner();
            let routeToGo = '/dashboard/';
            if (userRes.settings?.rememberLastPage) {
              const lastPage = await this.storage.getLastPage();
              if (lastPage?.length) {
                routeToGo += lastPage;
              } else if (userRes.settings?.defaultPage?.length) {
                routeToGo += userRes.settings?.defaultPage;
              }
            } else if (userRes.settings?.defaultPage?.length) {
              routeToGo += userRes.settings?.defaultPage;
            }
            await this.router.navigate([routeToGo], { replaceUrl: true });
          });
        }).catch(err => {
          // console.log(err);
        });
    }).catch(err => {
      this.common.hideSpinner();
      // console.log(err);
      this.errorMessages = err.error?.status ? err.error.status : 'Something went wrong, Please try again later';
    });
  }
}
