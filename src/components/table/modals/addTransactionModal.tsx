import { useEffect } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../layout/Modal";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { addTransaction } from "../../../actions/transactions";
import { useSnapshot } from "valtio";
import { transactionFormState, modalState } from "../../../states";
import { Transaction as TransactionEnum, TransactionType, TransactionTypeDisplay } from "../../../enums/transactions";
import { Transaction as TransactionButtonEnum } from "../../../enums/button";
import { getProducts } from "../../../actions/products";
import { productsState } from "../../../states";
import { useParams } from "react-router";

export const AddTransactionModal = ({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const formSnap = useSnapshot(transactionFormState);
    const productsSnap = useSnapshot(productsState);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (isOpen) {
            // Reset form data when modal opens
            transactionFormState.formData = {
                title: "",
                type: TransactionType.IN,
                amount: 0,
                product: "",
                comment: "",
            };

            // Load products if not already loaded
            const fetchProducts = async () => {
                try {
                    if (productsSnap.data.data.length === 0) {
                        const productsData = await getProducts("?limit=1000");
                        productsState.data = productsData || {
                            data: [],
                            pagination: {
                                currentPage: 1,
                                totalPages: 1,
                                totalCount: 0,
                                limit: 1000,
                                hasNextPage: false,
                                hasPrevPage: false,
                            },
                        };
                    }
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            };

            fetchProducts();
        }
    }, [isOpen]);

    const handleInputChange = (field: string, value: string | number) => {
        transactionFormState.formData = {
            ...transactionFormState.formData,
            [field]: value,
        };
    };

    const handleSubmit = async () => {
        if (!id) {
            toast.error("Wallet ID is missing");
            return;
        }

        if (!formSnap.formData.title || !formSnap.formData.amount || formSnap.formData.amount <= 0) {
            toast.error("გთხოვთ შეიყვანოთ დასახელება და ოდენობა");
            return;
        }

        transactionFormState.loading = true;
        try {
            // Find product by title if product field is filled
            let productId: string | undefined = undefined;
            if (formSnap.formData.product) {
                const selectedProduct = productsSnap.data.data.find(
                    (p) => p.title === formSnap.formData.product
                );
                if (selectedProduct) {
                    productId = selectedProduct._id.toString();
                }
            }

            const response = await addTransaction({
                title: formSnap.formData.title,
                wallet: id,
                type: formSnap.formData.type,
                amount: formSnap.formData.amount,
                product: productId,
                comment: formSnap.formData.comment || undefined,
            });

            if (response && response.data) {
                toast.success(response.message);
                onSuccess();
            }
        } catch (error: any) {
            console.error("Error adding transaction:", error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            transactionFormState.loading = false;
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={TransactionButtonEnum.TRANSACTION_ADD}
            size="md"
            actionButtons={{
                primary: {
                    title: "დამატება",
                    onClick: handleSubmit,
                    type: formSnap.loading ? "disabled" : "gold",
                },
                secondary: {
                    title: "გაუქმება",
                    onClick: onClose,
                    type: formSnap.loading ? "disabled" : "white",
                },
            }}
        >
            <div className="space-y-4">
                <Input
                    label={TransactionEnum.TITLE}
                    value={formSnap.formData.title}
                    onChange={(value: string) => handleInputChange("title", value)}
                    required
                />

                <Select
                    label={TransactionEnum.TYPE}
                    value={formSnap.formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value as TransactionType)}
                >
                    <option value={TransactionType.IN}>{TransactionTypeDisplay.IN}</option>
                    <option value={TransactionType.OUT}>{TransactionTypeDisplay.OUT}</option>
                </Select>

                <Input
                    label={TransactionEnum.AMOUNT}
                    type="number"
                    value={formSnap.formData.amount}
                    onChange={(value: string) => handleInputChange("amount", Number(value))}
                    step="0.01"
                    min="0"
                    required
                />

                <Select
                    label={TransactionEnum.PRODUCT}
                    value={formSnap.formData.product}
                    onChange={(e) => handleInputChange("product", e.target.value)}
                >
                    <option value="">-- არ არის არჩეული --</option>
                    {productsSnap.data.data.map((product) => (
                        <option key={product._id} value={product.title}>
                            {product.title} (N: {product._id})
                        </option>
                    ))}
                </Select>

                <Input
                    label={TransactionEnum.COMMENT}
                    value={formSnap.formData.comment}
                    onChange={(value: string) => handleInputChange("comment", value)}
                />
            </div>
        </Modal>
    );
};
