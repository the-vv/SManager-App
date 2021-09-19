import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { StorageKeyNames } from '../models/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  allKeys: string[] = [];

  constructor() { }

  async addKey(key: string) {
    this.allKeys.push(key);
    await Storage.set({
      key: StorageKeyNames.uuidKeys,
      value: JSON.stringify(key),
    });
  }

}
