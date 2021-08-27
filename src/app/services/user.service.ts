import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpService } from './http.service';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userUrl = 'user';
  constructor(private http: HttpService) { }

  login(values: User) {
    this.http.postAsync(values, [this.userUrl, 'login'].join('/'))
      .subscribe(user => {
        if (user) {
          console.log('user');
        }
      });
  }
  signup(values: User) {
    this.http.postAsync(values, [this.userUrl, 'signup'].join('/'))
      .subscribe(user => {
        if (user) {
          console.log('user');
        }
      });
  }
  async setUser(user: User) {
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
          resolve(JSON.parse(value));
        } catch (err) {
          reject(err);
        }
      } else {
        reject();
      }
    });
  }
}
