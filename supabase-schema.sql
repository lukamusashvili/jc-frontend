-- Supabase Database Schema Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences for custom IDs (replacing MongoDB counters)
CREATE SEQUENCE IF NOT EXISTS product_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS category_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS supplier_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS wallet_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS transaction_id_seq START 1;

-- Products table
CREATE TABLE IF NOT EXISTS product (
    _id BIGINT PRIMARY KEY DEFAULT nextval('product_id_seq'),
    title TEXT NOT NULL,
    category TEXT,
    supplier TEXT,
    total_quantity NUMERIC DEFAULT 0,
    quantity NUMERIC DEFAULT 0,
    unit_cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    current_total_cost NUMERIC DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    total_price NUMERIC DEFAULT 0,
    unit_profit NUMERIC DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    profit_percentage NUMERIC DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS category (
    _id BIGINT PRIMARY KEY DEFAULT nextval('category_id_seq'),
    title TEXT NOT NULL UNIQUE
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS supplier (
    _id BIGINT PRIMARY KEY DEFAULT nextval('supplier_id_seq'),
    title TEXT NOT NULL UNIQUE
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallet (
    _id BIGINT PRIMARY KEY DEFAULT nextval('wallet_id_seq'),
    title TEXT NOT NULL UNIQUE,
    balance NUMERIC DEFAULT 0,
    comment TEXT
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    _id BIGINT PRIMARY KEY DEFAULT nextval('transaction_id_seq'),
    title TEXT NOT NULL,
    wallet TEXT NOT NULL,
    type TEXT CHECK (type IN ('in', 'out')),
    amount NUMERIC NOT NULL,
    product TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category);
CREATE INDEX IF NOT EXISTS idx_product_supplier ON product(supplier);
CREATE INDEX IF NOT EXISTS idx_product_created_at ON product(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies: Allow all operations for authenticated users
-- Since you have a single admin, authenticated users can do everything

-- Products policies
CREATE POLICY "product_allow_all_authenticated" ON product
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Categories policies
CREATE POLICY "category_allow_all_authenticated" ON category
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Suppliers policies
CREATE POLICY "supplier_allow_all_authenticated" ON supplier
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Wallets policies
CREATE POLICY "wallet_allow_all_authenticated" ON wallet
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Transactions policies
CREATE POLICY "transactions_allow_all_authenticated" ON transactions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for product table
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
