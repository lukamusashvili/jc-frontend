import { proxy } from "valtio";
import { Wallet, Transaction, WalletFormData } from "../types/finances";
import { TransactionType } from "../enums/transactions";

// Wallets State
export const walletsState = proxy({
    data: [] as Wallet[],
    loading: false,
});

// Transactions State
export const transactionsState = proxy({
    data: {
        data: [] as Transaction[],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        },
    },
    loading: false,
});

// Wallet Form State
export const walletFormState = proxy({
    loading: false,
    wallet: null as Wallet | null,
    formData: {
        title: "",
        balance: 0,
        comment: "",
    } as WalletFormData,
});

// Transaction Form State
export const transactionFormState = proxy({
    loading: false,
    formData: {
        title: "",
        type: TransactionType.IN,
        amount: 0,
        product: "",
        comment: "",
    },
});

