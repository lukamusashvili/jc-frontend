import supabase from "../utils/supabase";
import { appState } from "../states";
import { LoginCredentials } from "../types/auth";

export async function login(credentials: LoginCredentials) {
    appState.loading = true;

    try {
        // Using Supabase Auth - treat 'user' as email
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.user, // Using user field as email
            password: credentials.password,
        });

        if (error) {
            // Custom error messages for better UX
            if (error.code === "invalid_credentials" || error.message?.includes("Invalid login credentials")) {
                throw new Error("მომხმარებლის სახელი ან პაროლი არასწორია");
            }
            throw new Error(error.message || "მომხმარებლის სახელი ან პაროლი არასწორია");
        }

        if (data && data.session) {
            // Store session token
            localStorage.setItem("token", data.session.access_token);
            return {
                message: "წარმატებული შესვლა",
                data: data.session.access_token,
            };
        }

        throw new Error("ავტორიზაცია ვერ მოხერხდა");
    } catch (error: any) {
        throw error.message || "ავტორიზაცია ვერ მოხერხდა";
    } finally {
        appState.loading = false;
    }
}

export async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
