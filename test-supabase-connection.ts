// Test script to verify Supabase connection and schema
// Run this in browser console or as a one-time check

import supabase from './src/utils/supabase';

async function testSupabaseConnection() {
    console.log('Testing Supabase connection...\n');

    // Test 1: Check if we can connect
    try {
        const { data, error } = await supabase.from('product').select('count').limit(1);
        if (error) {
            console.error('❌ Connection failed:', error.message);
            return;
        }
        console.log('✅ Connection successful!');
    } catch (error: any) {
        console.error('❌ Connection error:', error.message);
        return;
    }

    // Test 2: Check if tables exist
    const tables = ['product', 'category', 'supplier', 'wallet', 'transactions'];
    console.log('\nChecking tables...');
    
    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`❌ Table "${table}" - Error: ${error.message}`);
            } else {
                console.log(`✅ Table "${table}" exists`);
            }
        } catch (error: any) {
            console.log(`❌ Table "${table}" - ${error.message}`);
        }
    }

    // Test 3: Check authentication
    console.log('\nChecking authentication...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        console.log('✅ User is authenticated');
        console.log('   User:', session.user.email);
    } else {
        console.log('⚠️  No active session - user needs to login');
    }

    console.log('\n✅ All tests completed!');
}

// Uncomment to run:
// testSupabaseConnection();

export default testSupabaseConnection;
