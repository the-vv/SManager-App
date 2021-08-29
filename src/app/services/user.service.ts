import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpService } from './http.service';
import { Storage } from '@capacitor/storage';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userUrl = 'user';
  currentUser: User = null;
  authEvents: BehaviorSubject<User | null> = new BehaviorSubject(null);
  isLoggedIn = false;
  constructor(private http: HttpService,
    private router: Router) { }

  login(values: User) {
    return this.http.postAsync(values, [this.userUrl, 'login'].join('/'))
      .pipe(tap((user) => {
        this.currentUser = user.user;
        this.isLoggedIn = true;
        this.authEvents.next(user.user);
        this.setUser(user);
      }));
  }
  signup(values: User) {
    return this.http.postAsync(values, [this.userUrl, 'signup'].join('/'))
      .pipe(tap((user) => {
        this.currentUser = user.user;
        this.isLoggedIn = true;
        this.authEvents.next(user.user);
        this.setUser(user);
      }));
  }
  async setUser(user: User) {
    console.log(user);
    await Storage.set({
      key: 'user',
      value: JSON.stringify(user),
    });
  };
  getUser(): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      const { value } = await Storage.get({ key: 'user' });
      if (value) {
        try {
          const user = JSON.parse(value).user;
          this.currentUser = user;
          this.isLoggedIn = true;
          this.authEvents.next(user);
          console.log(user);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      } else {
        reject();
      }
    });
  }
  async logout() {
    await Storage.remove({
      key: 'user'
    });
    this.currentUser = null;
    this.isLoggedIn = false;
    this.authEvents.next(null);
    this.router.navigate(['login'], { replaceUrl: true });
  }
  gLoginSetupUser(userCred: User) {
    console.log(userCred);
    return this.http.putAsync(userCred, this.userUrl)
    .pipe(tap((user) => {
      this.currentUser = user.user;
      this.isLoggedIn = true;
      this.authEvents.next(user.user);
      this.setUser(user);
    }));
  }
}
