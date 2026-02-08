import { InputProps } from "../types/ui";

export const Input = ({
    label,
    required,
    type = "text",
    value,
    onChange,
    max,
    placeholder,
    ...props
}: InputProps) => {
    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-[var(--color-black)] mb-1">
                    {label}
                </label>
            )}
            <input
                {...props}
                type={type}
                value={value}
                max={max}
                placeholder={placeholder}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full text-[var(--color-black)] bg-[var(--color-white)] h-[45px] rounded-lg border-[var(--color-black)] border border-opacity-60 px-5 py-4 text-sm`}
            />
        </div>
    );
};
