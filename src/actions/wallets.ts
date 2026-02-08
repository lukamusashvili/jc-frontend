import supabase from "../utils/supabase";
import { Wallet, WalletFormData } from "../types/finances";

export async function getWallets() {
    try {
        const { data, error } = await supabase
            .from("wallet")
            .select("_id, title, balance, comment")
            .order("_id", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error: any) {
        console.error("Error fetching wallets:", error);
        throw error;
    }
}

export async function addWallet(data: WalletFormData) {
    try {
        // Check if wallet with same title exists
        const { data: existing } = await supabase
            .from("wallet")
            .select("_id")
            .eq("title", data.title)
            .single();

        if (existing) {
            throw new Error("საფულე უკვე არსებობს");
        }

        const { data: result, error } = await supabase
            .from("wallet")
            .insert({
                title: data.title,
                balance: data.balance || 0,
                comment: data.comment || null,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "საფულე წარმატებით დაემატა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error adding wallet:", error);
        throw error;
    }
}

export async function editWallet(data: Wallet) {
    try {
        if (!data._id) {
            throw new Error("Wallet ID is required");
        }

        const { data: result, error } = await supabase
            .from("wallet")
            .update({
                title: data.title,
                balance: data.balance,
                comment: data.comment || null,
            })
            .eq("_id", data._id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "საფულე წარმატებით განახლდა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error updating wallet:", error);
        throw error;
    }
}

export async function deleteWallet(id: number) {
    try {
        const { error } = await supabase
            .from("wallet")
            .delete()
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "საფულე წარმატებით წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error deleting wallet:", error);
        throw error;
    }
}
