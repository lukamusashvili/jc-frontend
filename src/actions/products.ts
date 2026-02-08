import supabase from "../utils/supabase";
import { Product } from "../types/products";
import { addTransaction } from "./transactions";
import { getWallets } from "./wallets";
import { TransactionType } from "../enums/transactions";

export async function getProducts(query: string) {
    try {
        const urlParams = new URLSearchParams(query);
        const page = parseInt(urlParams.get("page") || "1");
        const limit = parseInt(urlParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Build filters
        let queryBuilder = supabase.from("product").select("*", { count: "exact" });

        // Category filter
        const categoryFilter = urlParams.get("category");
        if (categoryFilter) {
            const categories = categoryFilter.split(",");
            queryBuilder = queryBuilder.in("category", categories);
        }

        // Supplier filter
        const supplierFilter = urlParams.get("supplier");
        if (supplierFilter) {
            const suppliers = supplierFilter.split(",");
            queryBuilder = queryBuilder.in("supplier", suppliers);
        }

        // Date filter
        const createdAtFrom = urlParams.get("createdAt.from");
        const createdAtTo = urlParams.get("createdAt.to");
        if (createdAtFrom && createdAtTo) {
            // Parse date format: "DD MM YYYY"
            const [fromDay, fromMonth, fromYear] = createdAtFrom.split(" ").map(Number);
            const [toDay, toMonth, toYear] = createdAtTo.split(" ").map(Number);
            
            if (fromDay && fromMonth && fromYear && toDay && toMonth && toYear) {
                const startDate = new Date(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0).toISOString();
                const endDate = new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999).toISOString();
                queryBuilder = queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
            }
        }

        // Apply pagination
        queryBuilder = queryBuilder.order("_id", { ascending: true }).range(skip, skip + limit - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
            throw error;
        }

        // Map created_at to createdAt for frontend compatibility
        const mappedData = (data || []).map((product: any) => ({
            ...product,
            createdAt: product.created_at || product.createdAt,
        }));

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: mappedData,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        console.error("Error fetching products:", error);
        throw error;
    }
}

export async function addProduct(data: Product) {
    try {
        // Calculate derived fields (same logic as backend)
        const productData: any = {
            title: data.title,
            category: data.category || null,
            supplier: data.supplier || null,
            total_quantity: data.total_quantity || 0,
            quantity: data.total_quantity || 0, // Set quantity equal to total_quantity initially
            unit_cost: data.unit_cost || 0,
            unit_price: data.unit_price || 0,
            comment: data.comment || null,
        };

        // Calculate financial fields
        productData.total_cost = productData.total_quantity * productData.unit_cost;
        productData.total_price = productData.total_quantity * productData.unit_price;
        productData.total_profit = productData.total_price - productData.total_cost;
        productData.current_total_cost = productData.total_cost;
        productData.unit_profit = productData.unit_price - productData.unit_cost;
        productData.profit_percentage = productData.unit_cost > 0 
            ? (productData.unit_profit / productData.unit_cost) * 100 
            : 0;

        const { data: result, error } = await supabase
            .from("product")
            .insert(productData)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Create transaction for product addition
        try {
            // Get wallets to find the default wallet (ID 1) or first wallet
            const wallets = await getWallets();
            const defaultWallet = wallets.find((w) => w._id === 1) || wallets[0];
            
            if (defaultWallet && productData.total_cost > 0) {
                await addTransaction({
                    title: "პროდუქტის დამატება",
                    wallet: defaultWallet._id.toString(),
                    type: TransactionType.OUT,
                    amount: productData.total_cost,
                    product: result._id.toString(),
                    comment: "შეიქმნა ავტომატურად",
                });
            }
        } catch (transactionError: any) {
            // Log error but don't fail the product creation
            console.error("Error creating transaction for product:", transactionError);
        }

        return {
            message: "პროდუქტი წარმატებით დაემატა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error adding product:", error);
        throw error;
    }
}

export async function editProduct(data: Product) {
    try {
        if (!data._id) {
            throw new Error("Product ID is required");
        }

        const productData: any = {
            title: data.title,
            category: data.category || null,
            supplier: data.supplier || null,
            total_quantity: data.total_quantity,
            quantity: data.quantity,
            unit_cost: data.unit_cost,
            unit_price: data.unit_price,
            comment: data.comment || null,
        };

        // Calculate financial fields (same logic as backend)
        productData.total_cost = productData.total_quantity * productData.unit_cost;
        productData.total_price = productData.total_quantity * productData.unit_price;
        productData.total_profit = productData.total_price - productData.total_cost;
        productData.current_total_cost = productData.quantity * productData.unit_cost;
        productData.unit_profit = productData.unit_price - productData.unit_cost;
        productData.profit_percentage = productData.unit_cost > 0 
            ? (productData.unit_profit / productData.unit_cost) * 100 
            : 0;

        const { data: result, error } = await supabase
            .from("product")
            .update(productData)
            .eq("_id", data._id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "პროდუქტი წარმატებით განახლდა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export async function deleteProduct(id: number) {
    try {
        const { error } = await supabase
            .from("product")
            .delete()
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "პროდუქტი წარმატებით წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        throw error;
    }
}
