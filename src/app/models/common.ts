import firebase from 'firebase/compat';
import { environment } from 'src/environments/environment';
import Timestamp = firebase.firestore.Timestamp;

export type FTimeStamp = Timestamp;

export interface IIncomeExpense {
    id?: string;
    title: string;
    description?: string;
    datetime: string | Date;
    type: ECashType;
    amount: number;
    synced?: boolean;
    userId: string;
    accountId?: string;
    categoryId?: string;
}

export interface IIncomeExpenseDB {
    id: string;
    title: string;
    description?: string;
    datetime: Timestamp | Date;
    type: ECashType;
    amount: number;
    synced: boolean;
    userId: string;
    accountId?: string;
    categoryId?: string;
}

export enum ECashType {
    expense = 'expense',
    income = 'income'
}

export interface IMonthWise {
    month: string;
    year: number;
    totalIncome: number;
    totalExpense: number;
}

export enum EStorageKeyNames {
    uuidKeys = 'keys',
    user = 'user',
    defaultAccount = 'defaultAccount',
    lastPage = 'lastPage',
    lastUsedTime = 'lastUsedTime',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ECollectionNames = {
    users: environment.production ? 'users' : 'users-dev',
    statements: environment.production ? 'statements' : 'statements-dev',
    basicDetals: environment.production ? 'basicDetals' : 'basicdetails-dev',
    accounts: environment.production ? 'bank-accounts' : 'bank-accounts-dev',
    categories: environment.production ? 'categories' : 'categories-dev',
    automations: environment.production ? 'automations' : 'automations-dev',
};

export enum EFirebaseActionTypes {
    added = 'added',
    modified = 'modified',
    removed = 'removed'
}

export enum EPageTypes {
    overview = 'overview',
    income = 'income',
    expense = 'expense',
}

export interface IUserSettings {
    rememberLastPage?: boolean;
    defaultPage?: EPageTypes;
    addLastMonthBalance?: boolean;
    lastUsedTime?: Date | FTimeStamp;
}


export interface IAccount {
    id?: string;
    name: string;
    userId: string;
}

export interface ICategory {
    id?: string;
    name: string;
    userId: string;
    color: string;
}

export interface IAutomation {
    id?: string;
    title: string;
    description?: string;
    userId: string;
    amount: number;
    accountId: string;
    categoryId: string;
    datetime: string | Date | Timestamp;
    active: boolean;
    lastExecuted: Date | Timestamp;
    frequency: EAutomationFrequency;
    type: ECashType;
}

export enum EAutomationFrequency {
    daily = 'daily',
    weekly = 'weekly',
    monthly = 'monthly',
    yearly = 'yearly'
}
