import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { EStorageKeyNames, IIncomeExpense } from '../models/common';

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

  public addOne(item: IIncomeExpense): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage?.set(item.id, JSON.stringify(item))
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public getOne(id: string): Promise<IIncomeExpense> {
    return new Promise((resolve, reject) => {
      this.storage?.get(id)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getIds(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.storage?.keys()
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getAll(): Promise<IIncomeExpense[]> {
    return new Promise((resolve, reject) => {
      const allIncomeExpenses: IIncomeExpense[] = [];
      try {
        this.storage?.forEach((value, key, index) => {
          // console.log(value);
          allIncomeExpenses.push(JSON.parse(value));
        }).then(res => {
          resolve(allIncomeExpenses);
        }).catch(e => {
          reject(allIncomeExpenses);
        });
      } catch (e) {
        console.error('parsing error\n', e);
        reject(allIncomeExpenses);
      }
    });
  }

  deleteOne(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage?.remove(id)
        .then(res => {
          resolve(res);
        }).catch(err => {
          reject(err);
        });
    });
  }

  deleteAll(): Promise<void> {
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

  updateOne(item: IIncomeExpense): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage?.set(item.id, JSON.stringify(item))
        .then(res => {
          resolve();
        })
        .catch(err => {
          reject();
        });
    });
  }

  updateMany(items: IIncomeExpense[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const promises = [];
      items.forEach(item => {
        promises.push(this.storage?.set(item.id, JSON.stringify(item)));
      });
      Promise.all(promises).then(res => {
        resolve();
      }).catch(err => {
        reject();
      });
    });
  }

}
