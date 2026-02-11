import { useEffect } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../layout/Modal";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { Combobox } from "../../Combobox";
import { editTransaction } from "../../../actions/transactions";
import { Transaction } from "../../../types/finances";
import { useSnapshot } from "valtio";
import { transactionFormState, productsState, modalState } from "../../../states";
import { Transaction as TransactionEnum, TransactionType, TransactionTypeDisplay } from "../../../enums/transactions";
import { Edit } from "../../../enums/confirmation";
import { getProducts } from "../../../actions/products";
import { useParams } from "react-router";

type EditTransactionModalProps = {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export const EditTransactionModal = ({
    transaction,
    isOpen,
    onClose,
    onSuccess,
}: EditTransactionModalProps) => {
    const formSnap = useSnapshot(transactionFormState);
    const productsSnap = useSnapshot(productsState);
    const modalSnap = useSnapshot(modalState);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (transaction && isOpen) {
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

            // Find product title by ID if product exists
            // Format as "Title (N: ID)" to match Combobox format
            let productTitle = "";
            if (transaction.product) {
                const product = productsSnap.data.data.find(
                    (p) => p._id.toString() === transaction.product
                );
                if (product) {
                    productTitle = `${product.title} (N: ${product._id})`;
                }
            }

            // Update the form data with transaction values
            transactionFormState.formData = {
                title: transaction.title || "",
                type: (transaction.type as TransactionType) || TransactionType.IN,
                amount: transaction.amount || 0,
                product: productTitle,
                comment: transaction.comment || "",
            };
        }
    }, [transaction, isOpen]);

    const handleInputChange = (field: string, value: string | number) => {
        transactionFormState.formData = {
            ...transactionFormState.formData,
            [field]: value,
        };
    };

    const handleSubmit = async () => {
        if (!transaction || !id) {
            toast.error("Transaction or Wallet ID is missing");
            return;
        }

        if (!formSnap.formData.title || !formSnap.formData.amount || formSnap.formData.amount <= 0) {
            toast.error("გთხოვთ შეიყვანოთ დასახელება და ოდენობა");
            return;
        }

        // Show confirmation modal first
        modalState.confirmEditTransaction = true;
    };

    const confirmSubmit = async () => {
        if (!transaction || !id) {
            toast.error("Transaction or Wallet ID is missing");
            return;
        }

        modalState.confirmEditTransaction = false;
        transactionFormState.loading = true;
        try {
            // Find product by title if product field is filled
            // The product field may contain "Title (N: ID)" format, so we need to extract the title
            let productId: string | undefined = undefined;
            if (formSnap.formData.product) {
                // Extract title from "Title (N: ID)" format or use as-is if it's just the title
                const productTitle = formSnap.formData.product.includes("(N:")
                    ? formSnap.formData.product.split("(N:")[0].trim()
                    : formSnap.formData.product;
                
                const selectedProduct = productsSnap.data.data.find(
                    (p) => p.title === productTitle
                );
                if (selectedProduct) {
                    productId = selectedProduct._id.toString();
                }
            }

            const response = await editTransaction(transaction._id, {
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
                onClose();
            }
        } catch (error: any) {
            console.error("Error editing transaction:", error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            transactionFormState.loading = false;
        }
    };

    const closeEditConfirmModal = () => {
        modalState.confirmEditTransaction = false;
    };

    if (!isOpen || !transaction) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="ტრანზაქციის რედაქტირება"
                size="md"
                actionButtons={{
                    primary: {
                        title: "განახლება",
                        onClick: handleSubmit,
                        type: formSnap.loading || modalSnap.confirmEditTransaction ? "disabled" : "gold",
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

                    <Combobox
                        label={TransactionEnum.PRODUCT}
                        value={formSnap.formData.product}
                        onChange={(value: string) =>
                            handleInputChange("product", value)
                        }
                        options={productsSnap.data.data.map((p) => ({
                            _id: p._id,
                            title: `${p.title} (N: ${p._id})`,
                        })) as readonly { readonly _id: number | string; readonly title: string }[]}
                        placeholder={`აირჩიეთ ან შეიყვანეთ პროდუქტი`}
                        modalKey="productSelector"
                    />

                    <Input
                        label={TransactionEnum.COMMENT}
                        value={formSnap.formData.comment}
                        onChange={(value: string) => handleInputChange("comment", value)}
                    />
                </div>
            </Modal>

            {/* Edit Confirmation Modal */}
            <Modal
                isOpen={modalSnap.confirmEditTransaction}
                onClose={closeEditConfirmModal}
                title="ყურადღება"
                size="md"
                actionButtons={{
                    primary: {
                        title: "დიახ",
                        onClick: confirmSubmit,
                        type: formSnap.loading ? "disabled" : "gold",
                    },
                    secondary: {
                        title: "გაუქმება",
                        onClick: closeEditConfirmModal,
                        type: formSnap.loading ? "disabled" : "white",
                    },
                }}
            >
                <div className="text-center py-4">
                    <p className="text-[var(--color-black)]">
                        {Edit.EDIT_TRANSACTION}
                    </p>
                </div>
            </Modal>
        </>
    );
};
