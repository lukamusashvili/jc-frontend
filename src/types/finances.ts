export interface Wallet {
    _id: number;
    title: string;
    balance: number;
    comment?: string;
}

import { TransactionType } from "../enums/transactions";

export interface Transaction {
    _id: number;
    title: string;
    wallet: string;
    type: TransactionType;
    amount: number;
    product?: string;
    comment?: string;
    deleted?: boolean;
    created_at?: string;
}

export interface WalletFormData {
    title: string;
    balance: number;
    comment: string;
}
