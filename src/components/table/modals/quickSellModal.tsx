import { Input } from "../../Input";
import { Modal } from "../../layout/Modal";
import { Product } from "../../../types/products";
import { editProduct } from "../../../actions/products";
import { useSnapshot } from "valtio";
import { productFormState } from "../../../states";
import { addTransaction } from "../../../actions/transactions";
import { getWallets } from "../../../actions/wallets";
import { TransactionType } from "../../../enums/transactions";

type QuickSellModalProps = {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export const QuickSellModal = ({
    product,
    isOpen,
    onClose,
    onSuccess,
}: QuickSellModalProps) => {
    const snap = useSnapshot(productFormState);

    if (!isOpen || !product) return null;

    const handleSubmit = async () => {
        if (!product) return;

        productFormState.loading = true;
        try {
            const quantitySold = snap.quantityData.quantity;
            const newQuantity = product.quantity - quantitySold;
            await editProduct({ ...product, quantity: newQuantity });

            // Create transaction for product sale
            try {
                // Get wallets to find the default wallet (ID 1) or first wallet
                const wallets = await getWallets();
                const defaultWallet = wallets.find((w) => w._id === 1) || wallets[0];
                
                if (defaultWallet && quantitySold > 0 && product.unit_price > 0) {
                    const saleAmount = product.unit_price * quantitySold;
                    await addTransaction({
                        title: "პროდუქტის გაყიდვა",
                        wallet: defaultWallet._id.toString(),
                        type: TransactionType.IN,
                        amount: saleAmount,
                        product: product._id.toString(),
                        comment: "შეიქმნა ავტომატურად",
                    });
                }
            } catch (transactionError: any) {
                // Log error but don't fail the product sale
                console.error("Error creating transaction for product sale:", transactionError);
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
            title="გაყიდვა"
            size="sm"
            actionButtons={{
                primary: {
                    title: "გაყიდვა",
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
                label="გასაყიდი რაოდენობა"
                type="number"
                value={snap.quantityData.quantity}
                onChange={(value) =>
                    (productFormState.quantityData.quantity = Number(value))
                }
                min="1"
                max={product.quantity}
                required
            />
        </Modal>
    );
};
