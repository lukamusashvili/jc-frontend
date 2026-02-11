import { useRef, useEffect } from "react";
import { useSnapshot } from "valtio";
import { InputProps } from "../types/ui";
import { modalState } from "../states/modal";
import { DeleteOutlined } from "@ant-design/icons";

interface ComboboxProps extends Omit<InputProps, 'onChange'> {
    options: readonly { readonly _id: number | string; readonly title: string }[];
    onChange: (value: string) => void;
    value: string;
    modalKey: 'supplierSelector' | 'categorySelector' | 'supplierFilter' | 'categoryFilter' | 'productSelector';
    onDelete?: (id: number, title: string) => void;
    type?: 'category' | 'supplier';
}

export const Combobox = ({
    label,
    options,
    value,
    onChange,
    placeholder,
    modalKey,
    onDelete,
    type,
    ...props
}: ComboboxProps) => {
    const modalSnap = useSnapshot(modalState);
    const isOpen = modalSnap[modalKey];
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Filter options based on value
    const filteredOptions = value
        ? options.filter(opt =>
            opt.title.toLowerCase().includes(value.toLowerCase())
        )
        : options;

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                modalState[modalKey] = false;
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, modalKey]);

    const handleSelect = (optionTitle: string) => {
        onChange(optionTitle);
        modalState[modalKey] = false;
        inputRef.current?.blur();
    };

    const handleButtonClick = () => {
        modalState[modalKey] = !isOpen;
    };

    const handleDeleteClick = (e: React.MouseEvent, option: { readonly _id: number | string; readonly title: string }) => {
        e.stopPropagation(); // Prevent selecting the option when clicking trash
        if (onDelete && type) {
            if (type === 'category') {
                modalState.categoryToDelete = { _id: Number(option._id), title: option.title };
                modalState.deleteCategory = true;
            } else if (type === 'supplier') {
                modalState.supplierToDelete = { _id: Number(option._id), title: option.title };
                modalState.deleteSupplier = true;
            }
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-[var(--color-black)] mb-1">
                    {label}
                </label>
            )}
            <div className="relative flex gap-2">
                <input
                    {...props}
                    ref={inputRef}
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 h-[45px] bg-[var(--color-white)] rounded-md px-3 text-sm border-[var(--color-black)] border border-opacity-60 text-[var(--color-black)]"
                />
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleButtonClick}
                    className="w-[45px] h-[45px] bg-[var(--color-white)] rounded-md border-[var(--color-black)] border border-opacity-60 flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-light)] transition-colors"
                >
                    <svg
                        className={`w-4 h-4 text-[var(--color-black)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 left-0 right-0 mt-1 top-full bg-[var(--color-white)] border border-[var(--color-black)] border-opacity-60 rounded-md shadow-lg max-h-60 overflow-auto"
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option._id}
                                    onClick={() => handleSelect(option.title)}
                                    className="px-3 py-2 text-sm text-[var(--color-black)] cursor-pointer hover:bg-[var(--color-bg-light)] flex items-center justify-between"
                                >
                                    <span className="flex-1">{option.title}</span>
                                    {onDelete && (
                                        <DeleteOutlined
                                            onClick={(e) => handleDeleteClick(e, option)}
                                            className="text-[var(--color-red)] hover:opacity-70 transition-opacity ml-2"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-[var(--color-gray)]">
                                {value ? "ახალი მნიშვნელობა" : "მონაცემები არ არის"}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
