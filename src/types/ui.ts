import { Product } from "./products";

// Button component types
export type ButtonProps = {
    title: string;
    onClick: () => void;
    type?: "gold" | "red" | "white" | "disabled" | "transparent";
    customClasses?: string;
};

// Input component types
export type InputProps = {
    label?: string;
    required?: boolean;
    type?: string;
    value?: string | number;
    onChange?: (value: string) => void;
    min?: string;
    max?: string | number;
    step?: string;
    placeholder?: string;
};

// Select component types
export type SelectProps = {
    disabled?: boolean;
    children?: React.ReactNode;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label?: string;
};

// Modal types
export type EditProductModalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};
