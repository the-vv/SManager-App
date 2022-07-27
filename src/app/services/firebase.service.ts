import { Injectable } from '@angular/core';
// import { createClient, SupabaseClient, } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { ECollectionNames, IIncomeExpense } from '../models/common';
import { IUser } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './config.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // private supabase: SupabaseClient;

  constructor(
    private config: ConfigService,
    private firestore: AngularFirestore
  ) {
    // this.supabase = createClient(
    //   environment.supabaseUrl,
    //   environment.supabaseKey
    // );
  }

  saveUser(user: IUser) {
    return new Promise((resolve, reject) => {
      this.firestore.doc(`${ECollectionNames.users}/${user.id}`).set(user, { merge: true })
        .then(dbRes => {
          console.log(dbRes);
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

  upsertMultipleIncomeExpenses(incomeExpenses: IIncomeExpense[]) {
    return new Promise((resolve, reject) => {
      // this.supabase.from(ETableNames.statements).upsert(incomeExpenses, { returning: 'minimal', onConflict: 'id' })
      //   .then(dbRes => {
      //     resolve(dbRes);
      //   }, err => {
      //     reject(err);
      //   });
    });
  }

  getAllIncomeExpenses(start: string, end: string) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(ECollectionNames.statements, ref => ref.where('userId', '==', this.config.currentUser.id)
        .where('datetime', '>=', start).where('datetime', '<=', end)).valueChanges().pipe(take(1))
        .subscribe({
          next: (dbRes) => {
            resolve(dbRes);
          },
          error: (err) => {
            reject(err);
          }
        });
      // this.supabase.from(ETableNames.statements).select()
      //   .eq('userId', this.config.currentUser.id)
      //   .gte('datetime', start)
      //   .lte('datetime', end)
      //   .then(dbRes => {
      //     console.log(dbRes);
      //     resolve(dbRes);
      //   }, err => {
      //     reject(err);
      //   });
    });
  }

  onIncomeExpenseChange(callback: (payload: any) => void) {
    // return this.supabase
    //   .from(`statements:userId=eq.${this.config.currentUser.id}`)
    //   .on('*', callback)
    //   .subscribe();
  }
}
