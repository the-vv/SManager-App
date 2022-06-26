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
    total: number;
    type: ECashType;
    items: IIncomeExpense[];
}

export enum EStorageKeyNames {
    uuidKeys = 'keys',
    user = 'user'
}

export enum ETableNames {
    users = 'users',
    statements = 'statements',
}
