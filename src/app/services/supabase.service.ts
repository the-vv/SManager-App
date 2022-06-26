import { Injectable } from '@angular/core';
import {
  createClient,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { ETableNames } from '../models/common';
import { IUser } from '../models/user';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
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
            this.supabase.from(ETableNames.users).update(user, { returning: 'minimal' }).eq('email', user.email)
              .then(dbRes => {
                resolve(dbRes);
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
                resolve(dbRes);
              }, err => {
                reject(err);
              });
          }
        }, err => {
          reject(err);
        });
    });
  }

}
