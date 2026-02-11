import { proxy } from "valtio";
import { Product, PaginationData } from "../types/products";

// Products State
export const productsState = proxy({
    data: {
        data: [] as Product[],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
        },
    } as PaginationData,
    loading: false,
});

// Product Form State
export const productFormState = proxy({
    loading: false,
    product: null as Product | null,
    formData: {
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
    },
    editFormData: {
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
    },
    quantityData: {
        total_quantity: 0,
        quantity: 0,
    },
    originalQuantity: 0,
    originalTotalQuantity: 0,
});
