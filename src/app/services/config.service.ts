import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public currentUser: IUser = null;
  public authEvents: BehaviorSubject<IUser | null> = new BehaviorSubject(null);
  public isLoggedIn = false;
  public cloudSyncing: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() { }
}
