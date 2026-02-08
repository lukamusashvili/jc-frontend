import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Helper to check if user is authenticated
export async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        // Clear any stale token
        localStorage.removeItem('token');
        return false;
    }
    
    // Sync token with localStorage for backward compatibility
    if (session.access_token) {
        localStorage.setItem('token', session.access_token);
    }
    
    return true;
}

// Helper to require auth (throws if not authenticated)
export async function requireAuth() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        toast.error('გთხოვთ გაიაროთ ავტორიზაცია.');
        throw new Error('Authentication required');
    }
}

export default supabase;
