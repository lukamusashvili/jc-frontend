import { Button } from "../Button";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actionButtons?: {
        primary?: {
            title: string;
            onClick: () => void;
            type?: "gold" | "red" | "disabled" | "white" | "transparent";
            loading?: boolean;
        };
        secondary?: {
            title: string;
            onClick: () => void;
            type?: "gold" | "red" | "disabled" | "white" | "transparent";
        };
    };
    size?: "sm" | "md" | "lg" | "xl";
};

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    actionButtons,
    size = "md",
}: ModalProps) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "w-96",
        md: "w-[500px]",
        lg: "w-[700px]",
        xl: "w-[900px]",
    };

    return (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
            <div
                className={`bg-[var(--color-white)] rounded-lg p-6 ${sizeClasses[size]} max-w-[90vw] shadow-lg border border-[var(--color-black)]`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative">
                    <div className="flex-1"></div>
                    <h2 className="text-xl font-bold text-[var(--color-black)] absolute left-1/2 transform -translate-x-1/2">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-gray)] hover:text-[var(--color-black)] text-2xl cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">{children}</div>

                {/* Action Buttons */}
                {actionButtons && (
                    <div className="flex gap-3">
                        {actionButtons.primary && (
                            <Button
                                title={actionButtons.primary.title}
                                onClick={actionButtons.primary.onClick}
                                type={actionButtons.primary.type || "gold"}
                                customClasses="flex-1"
                            />
                        )}
                        {actionButtons.secondary && (
                            <Button
                                title={actionButtons.secondary.title}
                                onClick={actionButtons.secondary.onClick}
                                type={actionButtons.secondary.type || "white"}
                                customClasses="flex-1 border-[var(--color-black)] border"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
