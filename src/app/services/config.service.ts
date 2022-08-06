import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IAccount } from '../models/common';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public currentUser: IUser = null;
  public authEvents: BehaviorSubject<IUser | null> = new BehaviorSubject(null);
  public isLoggedIn = false;
  public cloudSyncing: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public currentUserAccounts: IAccount[] = [];
  public currentAccountId = '';
  public preventAppClose = false;

  constructor() { }
}
