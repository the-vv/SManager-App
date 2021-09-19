import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { IncomeExpense } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private storage: Storage | null = null;

  constructor(
    private storageService: Storage
  ) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storageService.create();
    this.storage = storage;
  }

  public addOne(item: IncomeExpense) {
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

  public getOne(id: string) {
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

  getIds() {
    this.storage.keys();
  }

  getAll() {
    return new Promise((resolve, reject) => {
      const allIncomeExpenses: IncomeExpense[] = [];
      try {
        this.storage.forEach((value, key, index) => {
          // console.log(JSON.parse(value));
          allIncomeExpenses.push(JSON.parse(value));
        }).then(res => {
          resolve(allIncomeExpenses);
        })
          .catch(e => {
            reject(allIncomeExpenses);
          });
      } catch (e) {
        console.error('parsing error\n', e);
        reject(allIncomeExpenses);
      }
    });
  }

}
