import supabase from "../utils/supabase";
import { getWallets, editWallet } from "./wallets";
import { TransactionType } from "../enums/transactions";

export async function getTransactions(walletId: string, query: string = "") {
    try {
        const urlParams = new URLSearchParams(query);
        const page = parseInt(urlParams.get("page") || "1");
        const limit = parseInt(urlParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Build query
        let queryBuilder = supabase
            .from("transactions")
            .select("*", { count: "exact" })
            .eq("wallet", walletId);
        
        // Filter out deleted transactions
        // Note: Run migration SQL first: ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
        queryBuilder = queryBuilder.eq("deleted", false);

        // Search filter (by product title)
        const searchTerm = urlParams.get("search");
        if (searchTerm) {
            // First, get product IDs that match the search term
            const { data: matchingProducts, error: productError } = await supabase
                .from("product")
                .select("_id")
                .ilike("title", `%${searchTerm}%`);
            
            if (productError) {
                throw productError;
            }
            
            // If products found, filter transactions by product IDs
            if (matchingProducts && matchingProducts.length > 0) {
                const productIds = matchingProducts.map((p) => p._id.toString());
                queryBuilder = queryBuilder.in("product", productIds);
            } else {
                // If no products match, return empty result by filtering to impossible condition
                queryBuilder = queryBuilder.eq("_id", -1);
            }
        }

        // Type filter
        const typeFilter = urlParams.get("type");
        if (typeFilter) {
            const types = typeFilter.split(",");
            queryBuilder = queryBuilder.in("type", types);
        }

        // Date filter for created_at
        const createdAtFrom = urlParams.get("created_at.from");
        const createdAtTo = urlParams.get("created_at.to");
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
        queryBuilder = queryBuilder
            .order("_id", { ascending: false })
            .range(skip, skip + limit - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
            throw error;
        }

        const totalPages = count ? Math.ceil(count / limit) : 1;

        return {
            data: data || [],
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: count || 0,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
}

export async function getTransactionsSum(walletId: string, query: string = "") {
    try {
        const urlParams = new URLSearchParams(query);

        // Build query (without pagination)
        let queryBuilder = supabase
            .from("transactions")
            .select("amount")
            .eq("wallet", walletId);
        
        // Filter out deleted transactions
        // Note: Run migration SQL first: ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
        queryBuilder = queryBuilder.eq("deleted", false);

        // Search filter (by product title)
        const searchTerm = urlParams.get("search");
        if (searchTerm) {
            // First, get product IDs that match the search term
            const { data: matchingProducts, error: productError } = await supabase
                .from("product")
                .select("_id")
                .ilike("title", `%${searchTerm}%`);
            
            if (productError) {
                throw productError;
            }
            
            // If products found, filter transactions by product IDs
            if (matchingProducts && matchingProducts.length > 0) {
                const productIds = matchingProducts.map((p) => p._id.toString());
                queryBuilder = queryBuilder.in("product", productIds);
            } else {
                // If no products match, return empty result by filtering to impossible condition
                queryBuilder = queryBuilder.eq("_id", -1);
            }
        }

        // Type filter
        const typeFilter = urlParams.get("type");
        if (typeFilter) {
            const types = typeFilter.split(",");
            queryBuilder = queryBuilder.in("type", types);
        }

        // Date filter for created_at
        const createdAtFrom = urlParams.get("created_at.from");
        const createdAtTo = urlParams.get("created_at.to");
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

        const { data, error } = await queryBuilder;

        if (error) {
            throw error;
        }

        // Sum all amounts
        const sum = (data || []).reduce((total, transaction) => {
            return total + Number(transaction.amount || 0);
        }, 0);

        return sum;
    } catch (error: any) {
        console.error("Error fetching transactions sum:", error);
        throw error;
    }
}

async function updateWalletBalance(walletId: string, amountChange: number) {
    try {
        const wallets = await getWallets();
        const wallet = wallets.find((w) => w._id.toString() === walletId);
        
        if (!wallet) {
            throw new Error("Wallet not found");
        }

        const newBalance = wallet.balance + amountChange;
        
        await editWallet({
            _id: wallet._id,
            title: wallet.title,
            balance: newBalance,
            comment: wallet.comment || undefined,
        });
    } catch (error: any) {
        console.error("Error updating wallet balance:", error);
        throw error;
    }
}

export async function addTransaction(data: {
    title: string;
    wallet: string;
    type: TransactionType;
    amount: number;
    product?: string;
    comment?: string;
}) {
    try {
        const { data: result, error } = await supabase
            .from("transactions")
            .insert({
                title: data.title,
                wallet: data.wallet,
                type: data.type,
                amount: data.amount,
                product: data.product || null,
                comment: data.comment || null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update wallet balance
        try {
            const amountChange = data.type === TransactionType.IN ? data.amount : -data.amount;
            await updateWalletBalance(data.wallet, amountChange);
        } catch (balanceError: any) {
            // Log error but don't fail the transaction creation
            console.error("Error updating wallet balance:", balanceError);
        }

        return {
            message: "ტრანზაქცია წარმატებით დაემატა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error adding transaction:", error);
        throw error;
    }
}

export async function editTransaction(
    id: number,
    data: {
        title: string;
        wallet: string;
        type: TransactionType;
        amount: number;
        product?: string;
        comment?: string;
    }
) {
    try {
        // Get the old transaction to reverse its effect
        const { data: oldTransaction, error: fetchError } = await supabase
            .from("transactions")
            .select("*")
            .eq("_id", id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Update the transaction
        const { data: result, error } = await supabase
            .from("transactions")
            .update({
                title: data.title,
                wallet: data.wallet,
                type: data.type,
                amount: data.amount,
                product: data.product || null,
                comment: data.comment || null,
            })
            .eq("_id", id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update wallet balances
        try {
            if (oldTransaction) {
                // Reverse the old transaction effect
                const oldAmountChange = oldTransaction.type === TransactionType.IN 
                    ? -oldTransaction.amount 
                    : oldTransaction.amount;
                
                // Apply the new transaction effect
                const newAmountChange = data.type === TransactionType.IN ? data.amount : -data.amount;
                
                // If wallet changed, update both wallets
                if (oldTransaction.wallet !== data.wallet) {
                    // Reverse effect on old wallet
                    await updateWalletBalance(oldTransaction.wallet, oldAmountChange);
                    // Apply effect on new wallet
                    await updateWalletBalance(data.wallet, newAmountChange);
                } else {
                    // Same wallet, calculate net change
                    const netChange = newAmountChange + oldAmountChange;
                    await updateWalletBalance(data.wallet, netChange);
                }
            }
        } catch (balanceError: any) {
            // Log error but don't fail the transaction update
            console.error("Error updating wallet balance:", balanceError);
        }

        return {
            message: "ტრანზაქცია წარმატებით განახლდა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error editing transaction:", error);
        throw error;
    }
}

export async function deleteTransaction(id: number) {
    try {
        // Soft delete: set deleted = true
        const { error } = await supabase
            .from("transactions")
            .update({ deleted: true })
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "ტრანზაქცია წარმატებით წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error deleting transaction:", error);
        throw error;
    }
}

export async function restoreTransaction(id: number) {
    try {
        const { error } = await supabase
            .from("transactions")
            .update({ deleted: false })
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "ტრანზაქცია წარმატებით აღდგენილია",
            data: null,
        };
    } catch (error: any) {
        console.error("Error restoring transaction:", error);
        throw error;
    }
}

export async function permanentDeleteTransaction(id: number) {
    try {
        // Get the transaction before deleting to reverse its effect
        const { data: transaction, error: fetchError } = await supabase
            .from("transactions")
            .select("*")
            .eq("_id", id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Permanently delete the transaction
        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("_id", id);

        if (error) {
            throw error;
        }

        // Reverse the transaction effect on wallet balance
        try {
            if (transaction) {
                const amountChange = transaction.type === TransactionType.IN 
                    ? -transaction.amount 
                    : transaction.amount;
                await updateWalletBalance(transaction.wallet, amountChange);
            }
        } catch (balanceError: any) {
            // Log error but don't fail the transaction deletion
            console.error("Error updating wallet balance:", balanceError);
        }

        return {
            message: "ტრანზაქცია მუდმივად წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error permanently deleting transaction:", error);
        throw error;
    }
}

export async function getDeletedTransactions(walletId: string, query: string = "") {
    try {
        const urlParams = new URLSearchParams(query);
        const page = parseInt(urlParams.get("page") || "1");
        const limit = parseInt(urlParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Build query - only get deleted transactions
        let queryBuilder = supabase
            .from("transactions")
            .select("*", { count: "exact" })
            .eq("wallet", walletId)
            .eq("deleted", true);

        // Search filter (by product title)
        const searchTerm = urlParams.get("search");
        if (searchTerm) {
            const { data: matchingProducts, error: productError } = await supabase
                .from("product")
                .select("_id")
                .ilike("title", `%${searchTerm}%`);
            
            if (productError) {
                throw productError;
            }
            
            if (matchingProducts && matchingProducts.length > 0) {
                const productIds = matchingProducts.map((p) => p._id.toString());
                queryBuilder = queryBuilder.in("product", productIds);
            } else {
                queryBuilder = queryBuilder.eq("_id", -1);
            }
        }

        // Type filter
        const typeFilter = urlParams.get("type");
        if (typeFilter) {
            const types = typeFilter.split(",");
            queryBuilder = queryBuilder.in("type", types);
        }

        // Date filter for created_at
        const createdAtFrom = urlParams.get("created_at.from");
        const createdAtTo = urlParams.get("created_at.to");
        if (createdAtFrom && createdAtTo) {
            const [fromDay, fromMonth, fromYear] = createdAtFrom.split(" ").map(Number);
            const [toDay, toMonth, toYear] = createdAtTo.split(" ").map(Number);
            
            if (fromDay && fromMonth && fromYear && toDay && toMonth && toYear) {
                const startDate = new Date(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0).toISOString();
                const endDate = new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999).toISOString();
                queryBuilder = queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
            }
        }

        // Apply pagination
        queryBuilder = queryBuilder
            .order("_id", { ascending: false })
            .range(skip, skip + limit - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
            throw error;
        }

        const totalPages = count ? Math.ceil(count / limit) : 1;

        return {
            data: data || [],
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: count || 0,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error: any) {
        console.error("Error fetching deleted transactions:", error);
        throw error;
    }
}
