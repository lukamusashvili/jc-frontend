import { proxy } from "valtio";
import { Supplier } from "../types/products";

// Suppliers State
export const suppliersState = proxy({
    data: [] as Supplier[],
    loading: false,
});
