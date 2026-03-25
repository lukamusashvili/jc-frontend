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

type QuickReturnModalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export const QuickReturnModal = ({
    product,
    isOpen,
    onClose,
    onSuccess,
}: QuickReturnModalProps) => {
    const snap = useSnapshot(productFormState);

    if (!isOpen || !product) return null;

    const handleSubmit = async () => {
        if (!product) return;

        const quantityReturned = snap.quantityData.quantity;

        if (quantityReturned > product.quantity) {
            toast.error(
                `არ შეიძლება ${quantityReturned} ერთეულის დაბრუნება. ხელმისაწვდომია მხოლოდ ${product.quantity} ერთეული.`,
            );
            return;
        }

        if (quantityReturned <= 0) {
            toast.error("დასაბრუნებელი რაოდენობა უნდა იყოს 0-ზე მეტი");
            return;
        }

        productFormState.loading = true;
        try {
            const newQuantity = product.quantity - quantityReturned;
            await editProduct({ ...product, quantity: newQuantity });

            try {
                const wallets = await getWallets();
                const returnWallet = wallets.find((w) => w._id === 3);

                if (
                    returnWallet &&
                    quantityReturned > 0 &&
                    product.unit_cost > 0
                ) {
                    const returnAmount = product.unit_cost * quantityReturned;
                    await addTransaction({
                        title: "პროდუქტის დაბრუნება",
                        wallet: returnWallet._id.toString(),
                        type: TransactionType.IN,
                        amount: returnAmount,
                        product: product._id.toString(),
                        comment: "შეიქმნა ავტომატურად",
                    });
                }
            } catch (transactionError: any) {
                console.error(
                    "Error creating transaction for product return:",
                    transactionError,
                );
            }

            onSuccess();
        } finally {
            productFormState.loading = false;
            onClose();
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
            title="დაბრუნება"
            size="sm"
            actionButtons={{
                primary: {
                    title: "დაბრუნება",
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
                label="დასაბრუნებელი რაოდენობა"
                type="number"
                value={snap.quantityData.quantity}
                onChange={(value) => {
                    const numValue = Number(value);
                    if (numValue > product.quantity) {
                        toast.error(`მაქსიმალური რაოდენობა: ${product.quantity}`);
                        productFormState.quantityData.quantity = product.quantity;
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
