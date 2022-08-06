import { Injectable } from '@angular/core';
// import { createClient, SupabaseClient, } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { ECollectionNames, IAccount, IIncomeExpense, IIncomeExpenseDB } from '../models/common';
import { IUser } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './config.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { filter, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private config: ConfigService,
    private firestore: AngularFirestore
  ) {
  }

  saveUser(user: IUser) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.users}/${user.id}`).set(user, { merge: true })
        .then(dbRes => {
          // console.log(dbRes);
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  addIncomeExpense(incomeExpense: IIncomeExpense) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(ECollectionNames.statements).add(incomeExpense)
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  deleteIncomeExpense(id: string) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.statements}/${id}`).delete()
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  updateIncomeExpense(incomeExpense: IIncomeExpense, id: string) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.statements}/${id}`).update(incomeExpense)
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  getAllIncomeExpenses(start: Date, end: Date, accountId: string) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(ECollectionNames.statements, ref => ref
        .where('userId', '==', this.config.currentUser.id)
        .where('datetime', '>=', start)
        .where('datetime', '<=', end)
        .where('accountId', '==', accountId)
        .orderBy('datetime', 'desc'))
        .valueChanges({ idField: 'id' }).pipe(take(1))
        .subscribe({
          next: (dbRes) => {
            resolve(dbRes);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  onIncomeExpenseChange(callback: (payload: any) => void) {
    // console.log('init value changes');
    return this.firestore.collection(ECollectionNames.statements, ref => ref
      .where('userId', '==', this.config.currentUser.id)
      .where('accountId', '==', this.config.currentAccountId))
      .stateChanges()
      .pipe(map(res => res.map(doc => ({
        data: {
          id: doc.payload.doc.id,
          ...doc.payload.doc.data() as any
        },
        type: doc.type
      })))).subscribe(callback);
  }

  createAccount(accountName: string) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(ECollectionNames.accounts).add({
        name: accountName,
        userId: this.config.currentUser.id
      }).then(dbRes => {
        resolve(dbRes);
      }).catch(err => {
        reject(err);
      });
    });
  }

  getUserAccounts() {
    return this.firestore.collection<IAccount>(ECollectionNames.accounts, ref => ref.where('userId', '==', this.config.currentUser.id))
      .valueChanges({ idField: 'id' });
  }

  getAllUserIncomeExpenseItems() {
    return this.firestore.collection<IIncomeExpenseDB>(ECollectionNames.statements,
      ref => ref.where('userId', '==', this.config.currentUser.id))
      .valueChanges({ idField: 'id' });
  }

  updateMultipleIncomeExpenseItems(incomeExpenseItems: IIncomeExpenseDB[]) {
    const updateArray: Promise<any>[] = [];
    incomeExpenseItems.forEach(incomeExpenseItem => {
      updateArray.push(this.updateIncomeExpense(incomeExpenseItem as IIncomeExpense, incomeExpenseItem.id));
    });
    return Promise.all(updateArray);
  }

}
