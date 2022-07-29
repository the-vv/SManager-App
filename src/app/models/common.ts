import firebase from 'firebase/compat';
import Timestamp = firebase.firestore.Timestamp;

export type FTimeStamp = Timestamp;

export interface IIncomeExpense {
    id?: string;
    title: string;
    description?: string;
    datetime: string | Date;
    type: ECashType;
    amount: number;
    synced: boolean;
    userId: string;
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
    user = 'user'
}

export enum ECollectionNames {
    users = 'users',
    statements = 'statements',
    basicDetals = 'basicDetals',
}

export enum EFirebaseActionTypes {
    added = 'added',
    modified = 'modified',
    removed = 'removed'
}

export enum EPageTypes {
    overview = 'overview',
    income = 'income',
    expense = 'expense',
    sessions = 'sessions',
}

export interface IUserSettings {
    darkTheme: boolean;
    rememberLastPage: boolean;
    defaultPage: EPageTypes;
}

export interface IBasicDetails {
    settings: IUserSettings;
    // totalIncome: number;
    // totalExpense: number;
    // totalBalance: number;
}
