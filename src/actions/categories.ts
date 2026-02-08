import supabase from "../utils/supabase";
import { Category } from "../types/products";

export async function getCategories() {
    try {
        const { data, error } = await supabase
            .from("category")
            .select("_id, title")
            .order("title", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}

export async function addCategory(data: Category) {
    try {
        const { data: result, error } = await supabase
            .from("category")
            .insert({ title: data.title })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "კატეგორია წარმატებით შეიქმნა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error adding category:", error);
        throw error;
    }
}

export async function editCategory(data: Category) {
    try {
        if (!data._id) {
            throw new Error("Category ID is required");
        }

        const { data: result, error } = await supabase
            .from("category")
            .update({ title: data.title })
            .eq("_id", data._id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            message: "კატეგორია წარმატებით განახლდა",
            data: result,
        };
    } catch (error: any) {
        console.error("Error updating category:", error);
        throw error;
    }
}

export async function deleteCategory(id: number) {
    try {
        const { error } = await supabase
            .from("category")
            .delete()
            .eq("_id", id);

        if (error) {
            throw error;
        }

        return {
            message: "კატეგორია წარმატებით წაიშალა",
            data: null,
        };
    } catch (error: any) {
        console.error("Error deleting category:", error);
        throw error;
    }
}
