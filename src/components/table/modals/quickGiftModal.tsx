import { Input } from "../../Input";
import { Modal } from "../../layout/Modal";
import { Product } from "../../../types/products";
import { editProduct } from "../../../actions/products";
import { useSnapshot } from "valtio";
import { productFormState } from "../../../states";
import { addTransaction } from "../../../actions/transactions";
import { getWallets } from "../../../actions/wallets";
import { TransactionType } from "../../../enums/transactions";
import { toast } from "react-toastify";

type QuickGiftModalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export const QuickGiftModal = ({
    product,
    isOpen,
    onClose,
    onSuccess,
}: QuickGiftModalProps) => {
    const snap = useSnapshot(productFormState);

    if (!isOpen || !product) return null;

    const handleSubmit = async () => {
        if (!product) return;

        const quantityGifted = snap.quantityData.quantity;

        // Validate that quantity gifted doesn't exceed available quantity
        if (quantityGifted > product.quantity) {
            toast.error(
                `არ შეიძლება ${quantityGifted} ერთეულის გაჩუქება. ხელმისაწვდომია მხოლოდ ${product.quantity} ერთეული.`,
            );
            return;
        }

        // Validate that quantity gifted is positive
        if (quantityGifted <= 0) {
            toast.error("გასაჩუქებელი რაოდენობა უნდა იყოს 0-ზე მეტი");
            return;
        }

        productFormState.loading = true;
        try {
            const newQuantity = product.quantity - quantityGifted;
            await editProduct({ ...product, quantity: newQuantity });

            // Create transaction for product gift
            try {
                // Get wallets to find the gift wallet (ID 2)
                const wallets = await getWallets();
                const giftWallet = wallets.find((w) => w._id === 2);

                if (
                    giftWallet &&
                    quantityGifted > 0 &&
                    product.unit_price > 0
                ) {
                    const giftAmount = product.unit_price * quantityGifted;
                    await addTransaction({
                        title: "პროდუქტის გაჩუქება",
                        wallet: giftWallet._id.toString(),
                        type: TransactionType.OUT,
                        amount: giftAmount,
                        product: product._id.toString(),
                        comment: "შეიქმნა ავტომატურად",
                    });
                }
            } catch (transactionError: any) {
                // Log error but don't fail the product gift
                console.error(
                    "Error creating transaction for product gift:",
                    transactionError,
                );
            }

            onSuccess();
        } catch (error: any) {
            // Backend error message is handled by the action
        } finally {
            productFormState.loading = false;
            onClose(); // Always close modal and refetch data
        }
    };

    const handleClose = () => {
        productFormState.quantityData.quantity = 1;
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="გაჩუქება"
            size="sm"
            actionButtons={{
                primary: {
                    title: "გაჩუქება",
                    onClick: handleSubmit,
                    type: snap.loading ? "disabled" : "gold",
                },
                secondary: {
                    title: "გაუქმება",
                    onClick: handleClose,
                    type: snap.loading ? "disabled" : "white",
                },
            }}
        >
            <div className="mb-4">
                <p className="text-sm text-[var(--color-gray)] mb-2">
                    პროდუქტი:{" "}
                    <span className="font-semibold">{product.title}</span>
                </p>
                <p className="text-sm text-[var(--color-gray)] mb-2">
                    ამჟამინდელი რაოდენობა:{" "}
                    <span className="font-semibold">{product.quantity}</span>
                </p>
            </div>

            <Input
                label="გასაჩუქებელი რაოდენობა"
                type="number"
                value={snap.quantityData.quantity}
                onChange={(value) => {
                    const numValue = Number(value);
                    // Prevent entering values greater than available quantity
                    if (numValue > product.quantity) {
                        toast.error(
                            `მაქსიმალური რაოდენობა: ${product.quantity}`,
                        );
                        productFormState.quantityData.quantity =
                            product.quantity;
                    } else if (numValue < 0) {
                        toast.error("რაოდენობა არ შეიძლება იყოს უარყოფითი");
                        productFormState.quantityData.quantity = 0;
                    } else {
                        productFormState.quantityData.quantity = numValue;
                    }
                }}
                min="1"
                max={product.quantity}
                required
            />
        </Modal>
    );
};
