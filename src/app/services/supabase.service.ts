import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { ETableNames, IIncomeExpense } from '../models/common';
import { IUser } from '../models/user';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor(
    private config: ConfigService
  ) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  saveUser(user: IUser) {
    return new Promise((resolve, reject) => {
      this.supabase.from(ETableNames.users).select().eq('email', user.email).single()
        .then(dbUserRes => {
          if (dbUserRes) {
            this.supabase.from(ETableNames.users).update(user).eq('email', user.email)
              .then(dbRes => {
                resolve(dbRes.body?.[0]);
              }, err => {
                reject(err);
              });
          } else {
            const userWithId = {
              ...user,
              id: uuidv4()
            };
            this.supabase.from(ETableNames.users).insert(userWithId, { returning: 'minimal' })
              .then(dbRes => {
                resolve(userWithId);
              }, err => {
                reject(err);
              });
          }
        }, err => {
          reject(err);
        });
    });
  }

  addIncomeExpense(incomeExpense: IIncomeExpense) {
    return new Promise((resolve, reject) => {
      this.supabase.from(ETableNames.statements).insert(incomeExpense, { returning: 'minimal' })
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  upsertMultipleIncomeExpenses(incomeExpenses: IIncomeExpense[]) {
    return new Promise((resolve, reject) => {
      this.supabase.from(ETableNames.statements).upsert(incomeExpenses, { returning: 'minimal', onConflict: 'id' })
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

  getAllIncomeExpenses() {
    // get all income expense by user id
    return new Promise((resolve, reject) => {
      this.supabase.from(ETableNames.statements).select().eq('userId', this.config.currentUser.id)
        .then(dbRes => {
          resolve(dbRes);
        }, err => {
          reject(err);
        });
    });
  }

}
