import { Product } from "./products";
import { Transaction } from "./finances";
import { Transaction as TransactionEnum } from "../enums/transactions";

export type ColumnSelectorModalProps = {
    allColumns: string[];
    visibleColumns: string[];
    onCheckboxChange: (key: string) => void;
};

export type TableProps<T = any> = {
    data: {
        data: T[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
        totalAmount?: number;
    };
    loading: boolean;
    columns: {
        displayColumns: (keyof T)[];
        filterableColumns: (keyof T)[];
        displayNames: Record<keyof T, string>;
    };
    onEdit?: (item: T) => void;
    onQuickSell?: (item: T) => void;
    onGift?: (item: T) => void;
    onDelete?: (item: T) => void;
    onRestore?: (item: T) => void;
    onPermanentDelete?: (item: T) => void;
};

export const productsColumns = {
    displayColumns: [
        "_id",
        "title",
        "category",
        "supplier",
        "createdAt",
        "quantity",
        "unit_price",
        "comment",
    ] as (keyof Product)[],

    filterableColumns: [
        "supplier",
        "category",
        "createdAt",
    ] as (keyof Product)[],

    displayNames: {
        _id: "N",
        title: "დასახელება",
        category: "კატეგორია",
        supplier: "მომწოდებელი",
        createdAt: "შექმნის თარიღი",
        quantity: "რაოდენობა",
        unit_price: "ფასი",
        unit_cost: "ღირებულება",
        comment: "კომენტარი",
    } as Record<keyof Product, string>,
};

export const transactionsColumns = {
    displayColumns: [
        "_id",
        "title",
        "created_at",
        "type",
        "amount",
        "product",
        "comment",
    ] as (keyof Transaction)[],

    filterableColumns: [
        "type",
        "created_at",
    ] as (keyof Transaction)[],

    displayNames: {
        _id: TransactionEnum.ID,
        title: TransactionEnum.TITLE,
        created_at: TransactionEnum.CREATED_AT,
        type: TransactionEnum.TYPE,
        amount: TransactionEnum.AMOUNT,
        product: TransactionEnum.PRODUCT,
        comment: TransactionEnum.COMMENT,
    } as Record<keyof Transaction, string>,
};

export type Pagination = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
