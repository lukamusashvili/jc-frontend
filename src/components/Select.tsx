import { SelectProps } from "../types/ui";

export const Select = ({
    disabled,
    children,
    label,
    ...props
}: SelectProps) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-[var(--color-black)] mb-1">
                    {label}
                </label>
            )}
            <select
                {...props}
                className={`w-full h-[45px] bg-[var(--color-white)] rounded-md px-3 text-sm cursor-pointer border-[var(--color-black)] border border-opacity-60 ${
                    disabled
                        ? `cursor-default text-[var(--color-gray)]`
                        : `cursor-pointer text-[var(--color-black)]`
                }`}
            >
                {children}
            </select>
        </div>
    );
};
