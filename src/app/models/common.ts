export interface IIncomeExpense {
    id: string;
    title: string;
    description?: string;
    datetime: string | Date;
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
}
