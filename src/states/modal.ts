import { proxy } from "valtio";
import { Product } from "../types/products";
import { Wallet, Transaction } from "../types/finances";

export const modalState = proxy({
    // Product modals
    addProduct: false,
    editProduct: false,
    sellProduct: false,
    giftProduct: false,
    returnProduct: false,
    deleteProduct: false,
    restoreProduct: false,
    permanentDeleteProduct: false,
    productToDelete: null as Product | null,
    confirmEditProduct: false,
    productToEdit: null as Product | null,
    
    // Wallet modals
    walletModal: false,
    deleteWallet: false,
    walletToDelete: null as Wallet | null,
    confirmEditWallet: false,
    walletToEdit: null as Wallet | null,
    
    // Transaction modals
    addTransaction: false,
    editTransaction: false,
    deleteTransaction: false,
    restoreTransaction: false,
    permanentDeleteTransaction: false,
    transactionToDelete: null as Transaction | null,
    transactionToEdit: null as Transaction | null,
    transactionToPermanentDelete: null as Transaction | null,
    confirmEditTransaction: false,
    
    // Selector modals (for combobox dropdowns)
    supplierSelector: false,
    categorySelector: false,
    productSelector: false,
    
    // Filter modals
    supplierFilter: false,
    categoryFilter: false,
    dateFilter: false,
    
    // Delete confirmation modals
    deleteCategory: false,
    deleteSupplier: false,
    categoryToDelete: null as { _id: number; title: string } | null,
    supplierToDelete: null as { _id: number; title: string } | null,
});
