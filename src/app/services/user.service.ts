import { Injectable } from '@angular/core';
import { IUser } from '../models/user';
import { HttpService } from './http.service';
import { Storage } from '@capacitor/storage';
import { Router } from '@angular/router';
import { EStorageKeyNames } from '../models/common';
import { ConfigService } from './config.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpService,
    private router: Router,
    private config: ConfigService,
    private auth: AngularFireAuth) { }

  setUser(user: IUser) {
    Storage.set({
      key: EStorageKeyNames.user,
      value: JSON.stringify(user),
    });
    this.config.authEvents.next(user);
    this.config.currentUser = user;
    this.config.isLoggedIn = true;
  };
  async getUser() {
    const user = await Storage.get({
      key: EStorageKeyNames.user
    });
    if (user.value) {
      this.config.currentUser = JSON.parse(user.value);
      this.config.isLoggedIn = true;
      this.config.authEvents.next(this.config.currentUser);
    }
    return this.config.currentUser;
  }
  async logout() {
    Storage.remove({ key: EStorageKeyNames.user });
    Storage.remove({ key: EStorageKeyNames.defaultAccount });
    Storage.remove({ key: EStorageKeyNames.lastPage });
    Storage.remove({ key: EStorageKeyNames.lastUsedTime });
    this.config.currentUser = null;
    this.config.isLoggedIn = false;
    this.config.currentAccountId = null;
    this.config.currentUserAccounts = [];
    await this.auth.signOut();
    this.config.authEvents.next(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }

}
