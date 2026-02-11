import { proxy } from "valtio";
import { productsState, productFormState } from "./product";
import { categoriesState } from "./category";
import { suppliersState } from "./supplier";
import { tableState, filterModalState } from "./table";
import { walletsState, transactionsState, walletFormState, transactionFormState } from "./finances";
import { modalState } from "./modal";
import { TransactionType } from "../enums/transactions";

// General app state
export const appState = proxy({
    loading: false,
});

export const authState = proxy({
    credentials: {
        user: "",
        password: "",
    },
});

export {
    productsState,
    productFormState,
    tableState,
    filterModalState,
    categoriesState,
    suppliersState,
    walletsState,
    transactionsState,
    walletFormState,
    transactionFormState,
    modalState,
};

// Reset all states
export const resetAllStates = () => {
    // Reset app state
    appState.loading = false;

    // Reset auth state
    authState.credentials = {
        user: "",
        password: "",
    };

    // Reset product state
    productsState.loading = false;
    productsState.data = {
        data: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        },
    };

    // Reset product form state
    productFormState.loading = false;
    productFormState.product = null;
    productFormState.formData = {
        title: "",
        category: "",
        supplier: "",
        total_quantity: 0,
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        current_total_cost: 0,
        unit_price: 0,
        total_price: 0,
        unit_profit: 0,
        total_profit: 0,
        profit_percentage: 0,
        comment: "",
    };
    productFormState.editFormData = {
        title: "",
        category: "",
        supplier: "",
        total_quantity: 0,
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        current_total_cost: 0,
        unit_price: 0,
        total_price: 0,
        unit_profit: 0,
        total_profit: 0,
        profit_percentage: 0,
        comment: "",
    };
    productFormState.quantityData = {
        total_quantity: 0,
        quantity: 0,
    };
    productFormState.originalQuantity = 0;
    productFormState.originalTotalQuantity = 0;

    // Reset categories state
    categoriesState.loading = false;
    categoriesState.data = [];

    // Reset suppliers state
    suppliersState.loading = false;
    suppliersState.data = [];

    // Reset wallets state
    walletsState.loading = false;
    walletsState.data = [];

    // Reset transactions state
    transactionsState.loading = false;
    transactionsState.data = {
        data: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        },
    };

    // Reset wallet form state
    walletFormState.loading = false;
    walletFormState.wallet = null;
    walletFormState.formData = {
        title: "",
        balance: 0,
        comment: "",
    };

    // Reset transaction form state
    transactionFormState.loading = false;
    transactionFormState.formData = {
        title: "",
        type: TransactionType.IN,
        amount: 0,
        product: "",
        comment: "",
    };

    // Reset table state
    tableState.activeFilterColumn = null;
    tableState.selectedProduct = null;

    // Reset modal state
        modalState.addProduct = false;
        modalState.editProduct = false;
        modalState.sellProduct = false;
        modalState.giftProduct = false;
        modalState.deleteProduct = false;
        modalState.restoreProduct = false;
        modalState.permanentDeleteProduct = false;
        modalState.productToDelete = null;
        modalState.walletModal = false;
        modalState.deleteWallet = false;
        modalState.walletToDelete = null;
        modalState.addTransaction = false;
        modalState.editTransaction = false;
        modalState.deleteTransaction = false;
        modalState.restoreTransaction = false;
        modalState.permanentDeleteTransaction = false;
        modalState.transactionToDelete = null;
        modalState.transactionToEdit = null;
        modalState.transactionToPermanentDelete = null;
        modalState.confirmEditTransaction = false;
        modalState.confirmEditProduct = false;
        modalState.productToEdit = null;
        modalState.confirmEditWallet = false;
        modalState.walletToEdit = null;
        modalState.supplierSelector = false;
        modalState.categorySelector = false;
        modalState.productSelector = false;
    modalState.supplierFilter = false;
    modalState.categoryFilter = false;
    modalState.dateFilter = false;
    modalState.deleteCategory = false;
    modalState.deleteSupplier = false;
    modalState.categoryToDelete = null;
    modalState.supplierToDelete = null;

    // Reset filter modal state
    filterModalState.filters = [];
    filterModalState.selectedFilters = [];
    filterModalState.fromDate = "";
    filterModalState.toDate = "";
    filterModalState.newCategory = "";
    filterModalState.newSupplier = "";
    filterModalState.categoryLoading = false;
    filterModalState.supplierLoading = false;
};
