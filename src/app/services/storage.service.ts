import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { IncomeExpense } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public  storage: Storage | null = null;
  public storageEvents: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private storageService: Storage
  ) {
    this.init();
  }

  async init(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // If using, define drivers here: await this.storage.defineDriver(/*...*/);
      const storage = await this.storageService.create();
      this.storage = storage;
      this.storageEvents.next(true);
      resolve();
    });
  }

  public addOne(item: IncomeExpense): Promise<any> {
    return new Promise((resolve, reject) => {
      /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }]*/
      this.storage?.set(item._id, JSON.stringify(item))
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public getOne(id: string): Promise<IncomeExpense> {
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

  getAll(): Promise<IncomeExpense[]>{
    return new Promise((resolve, reject) => {
      const allIncomeExpenses: IncomeExpense[] = [];
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

}
