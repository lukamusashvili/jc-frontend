import { ButtonProps } from "../types/ui";

export const Button = ({
    title,
    onClick,
    type,
    customClasses,
}: ButtonProps) => {
    const getButtonClasses = () => {
        const baseClasses =
            "w-full text-sm font-bold h-[45px] px-4 rounded-md border-[var(--color-black)] border";

        // If customClasses contains bg- class, don't apply type-based background
        const hasCustomBg = customClasses?.includes("bg-");

        if (type === "disabled") {
            return `${baseClasses} cursor-default text-[var(--color-gray)] ${!hasCustomBg ? "bg-[var(--color-bg-light)]" : ""}`;
        }

        if (type === "red") {
            return `${baseClasses} cursor-pointer text-[var(--color-white)] ${!hasCustomBg ? "bg-[var(--color-red)] hover:bg-[var(--color-dark-red)]" : ""}`;
        }

        if (type === "white") {
            return `${baseClasses} cursor-pointer text-[var(--color-black)] ${!hasCustomBg ? "bg-[var(--color-white)] hover:bg-[var(--color-bg-light)]" : ""}`;
        }

        if (type === "gold") {
            return `${baseClasses} cursor-pointer text-[var(--color-white)] ${!hasCustomBg ? "bg-[var(--color-gold)] hover:bg-[var(--color-dark-gold)]" : ""}`;
        }

        if (type === "transparent") {
            return `${baseClasses} cursor-pointer ${!hasCustomBg ? "bg-transparent" : ""}`;
        }

        return baseClasses;
    };

    return (
        <button
            disabled={type === "disabled"}
            onClick={onClick}
            className={`${getButtonClasses()} ${customClasses || ""}`}
        >
            {title}
        </button>
    );
};
