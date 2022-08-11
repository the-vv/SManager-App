import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { EStorageKeyNames } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public storage: Storage | null = null;
  public storageEvents: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private storageService: Storage
  ) {
    this.init();
  }

  async init(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const storage = await this.storageService.create();
      this.storage = storage;
      this.storageEvents.next(true);
      resolve();
    });
  }

  public getDefaultAccount(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.storage.get(EStorageKeyNames.defaultAccount)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }

  public setDefaultAccount(item: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set(EStorageKeyNames.defaultAccount, item)
        .then(res => {
          resolve();
        }).catch(err => {
          reject(err);
        });
    });
  }

  public setLastPage(item: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set(EStorageKeyNames.lastPage, item)
        .then(res => {
          resolve();
        }).catch(err => {
          reject(err);
        });
    });
  }

  public getLastPage(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.storage.get(EStorageKeyNames.lastPage)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }

  public setLastUsedTime(item: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set(EStorageKeyNames.lastUsedTime, item)
        .then(res => {
          resolve();
        }).catch(err => {
          reject(err);
        });
    });
  }

  public getLastUsedTime(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.storage.get(EStorageKeyNames.lastUsedTime)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }

  public deleteAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage?.clear()
        .then(res => {
          resolve();
        })
        .catch(err => {
          reject();
        });
    });
  }

  public setUser(item: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.set(EStorageKeyNames.user, item)
        .then(res => {
          resolve();
        }).catch(err => {
          reject(err);
        });
    });
  }

  public getUser(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.storage.get(EStorageKeyNames.user)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }




}
