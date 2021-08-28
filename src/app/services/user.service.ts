import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpService } from './http.service';
import { Storage } from '@capacitor/storage';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userUrl = 'user';
  currentUser: User = null;
  constructor(private http: HttpService,
    private router: Router) { }

  login(values: User) {
    return this.http.postAsync(values, [this.userUrl, 'login'].join('/'))
      .pipe(tap((user) => {
        this.currentUser = user.user;
        this.setUser(user);
      }));
  }
  signup(values: User) {
    return this.http.postAsync(values, [this.userUrl, 'signup'].join('/'))
      .pipe(tap((user) => {
        this.currentUser = user.user;
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
    this.router.navigate(['signup'], { replaceUrl: true });
  }
}
