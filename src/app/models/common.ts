export interface IncomeExpense {
    _id?: string;
    title: string;
    description?: string;
    datetime: string | Date;
    type: CashType;
    amount: number;
}

export enum CashType {
    expense = 'expense',
    income = 'income'
}
