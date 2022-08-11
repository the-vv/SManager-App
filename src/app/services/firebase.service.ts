import { Injectable } from '@angular/core';
import { ECollectionNames, IAccount, ICategory, IIncomeExpense, IIncomeExpenseDB, IUserSettings } from '../models/common';
import { IUser } from '../models/user';
import { ConfigService } from './config.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs';

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
          this.firestore.doc(`${ECollectionNames.users}/${user.id}`).valueChanges().pipe(take(1))
            .subscribe({
              next: res => {
                resolve(res);
              },
              error: err => {
                reject(err);
              }
            });
        }, err => {
          reject(err);
        });
    });
  }

  addMultipleIncomeExpenseItems(incomeExpenseItems: IIncomeExpense[]) {
    return new Promise((resolve, reject) => {
      const addArray: Promise<any>[] = [];
      incomeExpenseItems.forEach(item => {
        addArray.push(this.firestore.collection(ECollectionNames.statements).add(item));
      });
      Promise.all(addArray).then(res => {
        resolve(res);
      }).catch(err => {
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
    return this.firestore.collection(ECollectionNames.statements, ref => ref
      .where('userId', '==', this.config.currentUser.id)
      .where('datetime', '>=', start)
      .where('datetime', '<=', end)
      .where('accountId', '==', accountId)
      .orderBy('datetime', 'desc'))
      .valueChanges({ idField: 'id' });
  }

  onIncomeExpenseChange(callback: (payload: any) => void) {
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

  updateAccount(account: IAccount) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.accounts}/${account.id}`).update(account)
        .then(dbRes => {
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

  createCategpry(category: ICategory) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(ECollectionNames.categories).add(category)
        .then(dbRes => {
          resolve(dbRes);
        }).catch(err => {
          reject(err);
        });
    });
  }

  getAllUserCategories() {
    return this.firestore.collection<ICategory>(ECollectionNames.categories, ref => ref.where('userId', '==', this.config.currentUser.id))
      .valueChanges({ idField: 'id' });
  }

  updateCategory(category: ICategory, id: string) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.categories}/${id}`).update(category)
        .then(dbRes => {
          resolve(dbRes);
        }).catch(err => {
          reject(err);
        });
    });
  }

  deleteCategory(id: string) {
    return new Promise((resolve, reject) => {
      this.firestore.collection<IIncomeExpenseDB>(ECollectionNames.statements, ref => ref
        .where('categoryId', '==', id)
        .where('userId', '==', this.config.currentUser.id))
        .valueChanges({ idField: 'id' }).pipe(take(1)).subscribe({
          next: res => {
            const updateArray: Promise<any>[] = [];
            res.forEach(doc => {
              doc.categoryId = '';
              updateArray.push(this.firestore.doc(`${ECollectionNames.statements}/${doc.id}`).update(doc));
            });
            Promise.all(updateArray).then(() => {
              this.firestore.doc(`${ECollectionNames.categories}/${id}`).delete()
                .then(dbRes => {
                  resolve(dbRes);
                }).catch(err => {
                  reject(err);
                });
            }).catch(err => {
              console.log(err);
              reject(err);
            });
          },
          error: err => {
            console.log(err);
            reject(err);
          }
        });
    });
  }

  deleteAccount(id: string) {
    return new Promise((resolve, reject) => {
      // delete all incomeExpenseItems mapped with this accountId
      this.firestore.collection(ECollectionNames.statements, ref => ref
        .where('accountId', '==', id)
        .where('userId', '==', this.config.currentUser.id))
        .valueChanges({ idField: 'id' }).pipe(take(1)).subscribe({
          next: res => {
            const deleteArray: Promise<any>[] = [];
            res.forEach(doc => {
              deleteArray.push(this.firestore.doc(`${ECollectionNames.statements}/${doc.id}`).delete());
            });
            Promise.all(deleteArray).then(() => {
              this.firestore.doc(`${ECollectionNames.accounts}/${id}`).delete()
                .then(dbRes => {
                  resolve(dbRes);
                }).catch(err => {
                  reject(err);
                });
            }).catch(err => {
              console.log(err);
              reject(err);
            });
          },
          error: err => {
            console.log(err);
            reject(err);
          }
        });
    });
  }

  updateUserSettings(settings: IUserSettings) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.users}/${this.config.currentUser.id}`).update({ settings })
        .then(dbRes => {
          resolve(dbRes);
        }).catch(err => {
          reject(err);
        });
    });
  }

}
