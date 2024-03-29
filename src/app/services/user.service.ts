import { Injectable } from '@angular/core';
import { IUser } from '../models/user';
import { Storage } from '@capacitor/storage';
import { Router } from '@angular/router';
import { EStorageKeyNames } from '../models/common';
import { ConfigService } from './config.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { StorageService } from './storage.service';
import { CommonService } from './common.service';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private router: Router,
    private config: ConfigService,
    private auth: AngularFireAuth,
    private storage: StorageService,
    private common: CommonService,
    private firebase: FirebaseService,
  ) { }

  setUser(user: IUser) {
    this.storage.setUser(JSON.stringify(user));
    this.config.authEvents.next(user);
    this.config.currentUser = user;
    this.config.isLoggedIn = true;
  };
  async getUser() {
    const user = await this.storage.getUser();
    if (user) {
      this.config.currentUser = JSON.parse(user);
      this.config.isLoggedIn = true;
      this.config.authEvents.next(this.config.currentUser);
    }
    return this.config.currentUser;
  }
  async logout() {
    await this.storage.deleteAll();
    this.config.currentUser = null;
    this.config.isLoggedIn = false;
    this.config.currentAccountId = null;
    this.config.currentUserAccounts = [];
    await this.auth.signOut();
    this.config.authEvents.next(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }

  updateLastUsedTime() {
    const newSettings = {
      ...this.config.currentUser.settings,
      lastUsedTime: new Date()
    };
    this.firebase.updateUserSettings(newSettings).then(() => {
      this.storage.setLastUsedTime(this.common.toLocaleIsoDateString(new Date()));
      this.config.currentUser.settings = newSettings;
      this.setUser(this.config.currentUser);
    }).catch(err => {
      console.log(err);
    });
  }

}
