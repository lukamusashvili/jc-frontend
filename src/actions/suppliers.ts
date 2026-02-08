import supabase from "../utils/supabase";
import { Supplier } from "../types/products";

export async function getSuppliers() {
    try {
        const { data, error } = await supabase
            .from("supplier")
            .select("_id, title")
            .order("title", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error: any) {
        console.error("Error fetching suppliers:", error);
        throw error;
    }
}

export async function addSupplier(data: Supplier) {
    try {
        const { data: result, error } = await supabase
            .from("supplier")
            .insert({ title: data.title })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "მომწოდებელი წარმატებით შეიქმნა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error adding supplier:", error);
        throw error;
    }
}

export async function editSupplier(data: Supplier) {
    try {
        if (!data._id) {
            throw new Error("Supplier ID is required");
        }

        const { data: result, error } = await supabase
            .from("supplier")
            .update({ title: data.title })
            .eq("_id", data._id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "მომწოდებელი წარმატებით განახლდა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error updating supplier:", error);
        throw error;
    }
}

export async function deleteSupplier(id: number) {
    try {
        const { error } = await supabase
            .from("supplier")
            .delete()
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "მომწოდებელი წარმატებით წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error deleting supplier:", error);
        throw error;
    }
}
