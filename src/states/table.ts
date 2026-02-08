import { proxy } from "valtio";
import { Product } from "../types/products";

// Table State
export const tableState = proxy({
    activeFilterColumn: null as string | number | symbol | null,
    selectedProduct: null as Product | null,
});

// Filter Modal State
export const filterModalState = proxy({
    filters: [] as any[],
    selectedFilters: [] as string[],
    fromDate: "",
    toDate: "",
    newCategory: "",
    newSupplier: "",
    categoryLoading: false,
    supplierLoading: false,
});
