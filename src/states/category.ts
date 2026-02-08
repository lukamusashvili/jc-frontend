import { proxy } from "valtio";
import { Category } from "../types/products";

// Categories State
export const categoriesState = proxy({
    data: [] as Category[],
    loading: false,
});
