import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { walletFormState } from "../../states";
import { Input } from "../Input";
import { Modal } from "../layout/Modal";
import { toast } from "react-toastify";
import { addWallet, editWallet } from "../../actions/wallets";
import { Wallet, WalletFormData } from "../../types/finances";

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    wallet?: Wallet | null;
}

export const WalletModal = ({
    isOpen,
    onClose,
    onSuccess,
    wallet,
}: WalletModalProps) => {
    const snap = useSnapshot(walletFormState);

    useEffect(() => {
        if (wallet) {
            // Edit mode
            walletFormState.formData = {
                title: wallet.title,
                balance: wallet.balance,
                comment: wallet.comment || "",
            };
        } else {
            // Add mode
            walletFormState.formData = {
                title: "",
                balance: 0,
                comment: "",
            };
        }
    }, [wallet]);

    const handleInputChange = (
        field: keyof WalletFormData,
        value: string | number
    ) => {
        walletFormState.formData = {
            ...walletFormState.formData,
            [field]: value,
        };
    };

    const handleSubmit = async () => {
        if (!snap.formData.title.trim()) {
            toast.error("გთხოვთ შეიყვანოთ საფულის დასახელება");
            return;
        }

        if (snap.formData.balance < 0) {
            toast.error("ბალანსი არ შეიძლება იყოს უარყოფითი");
            return;
        }

        walletFormState.loading = true;
        try {
            if (wallet) {
                // Edit existing wallet
                const response = await editWallet({
                    _id: wallet._id,
                    ...snap.formData,
                });
                toast.success(response.message || "საფულე წარმატებით განახლდა");
            } else {
                // Add new wallet
                const response = await addWallet(snap.formData);
                toast.success(response.message || "საფულე წარმატებით დაემატა");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "შეცდომა მოხდა"
            );
        } finally {
            walletFormState.loading = false;
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={wallet ? "საფულის რედაქტირება" : "საფულის დამატება"}
            size="md"
            actionButtons={{
                primary: {
                    title: wallet ? "განახლება" : "დამატება",
                    onClick: handleSubmit,
                    type: snap.loading ? "disabled" : "gold",
                },
                secondary: {
                    title: "გაუქმება",
                    onClick: onClose,
                    type: snap.loading ? "disabled" : "white",
                },
            }}
        >
            <div className="space-y-4">
                <Input
                    label="დასახელება *"
                    value={snap.formData.title}
                    onChange={(value: string) =>
                        handleInputChange("title", value)
                    }
                    required
                />

                <Input
                    label="ბალანსი (₾) *"
                    type="number"
                    value={snap.formData.balance}
                    onChange={(value: string) =>
                        handleInputChange("balance", Number(value))
                    }
                    required
                    min="0"
                    step="0.01"
                />

                <Input
                    label="კომენტარი"
                    value={snap.formData.comment}
                    onChange={(value: string) =>
                        handleInputChange("comment", value)
                    }
                />
            </div>
        </Modal>
    );
};
