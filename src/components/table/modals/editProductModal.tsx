import { useEffect } from "react";
import { toast } from "react-toastify";
import { Modal } from "../../layout/Modal";
import { Input } from "../../Input";
import { Combobox } from "../../Combobox";
import { editProduct } from "../../../actions/products";
import { Product } from "../../../types/products";
import { Product as ProductEnum } from "../../../enums/product";
import { useSnapshot } from "valtio";
import {
    categoriesState,
    suppliersState,
    productFormState,
    modalState,
} from "../../../states";
import { EditProductModalProps } from "../../../types/ui";
import { getCategories, addCategory, deleteCategory } from "../../../actions/categories";
import { getSuppliers, addSupplier, deleteSupplier } from "../../../actions/suppliers";

export const EditProductModal = ({
    product,
    isOpen,
    onClose,
    onSuccess,
}: EditProductModalProps) => {
    const categoriesSnap = useSnapshot(categoriesState);
    const suppliersSnap = useSnapshot(suppliersState);
    const formSnap = useSnapshot(productFormState);
    const modalSnap = useSnapshot(modalState);

    useEffect(() => {
        if (product) {
            // Update the editFormData in the valtio state with all fields
            productFormState.editFormData = {
                title: product.title || "",
                category: product.category || "",
                supplier: product.supplier || "",
                quantity: product.quantity || 0,
                total_quantity: product.total_quantity || 0,
                unit_cost: product.unit_cost || 0,
                unit_price: product.unit_price || 0,
                total_cost: product.total_cost || 0,
                current_total_cost: product.current_total_cost || 0,
                total_price: product.total_price || 0,
                unit_profit: product.unit_profit || 0,
                total_profit: product.total_profit || 0,
                profit_percentage: product.profit_percentage || 0,
                comment: product.comment || "",
            };

            // Load categories and suppliers if not already loaded
            const fetchData = async () => {
                try {
                    if (categoriesSnap.data.length === 0) {
                        const categoriesData = await getCategories();
                        categoriesState.data = categoriesData || [];
                    }
                    if (suppliersSnap.data.length === 0) {
                        const suppliersData = await getSuppliers();
                        suppliersState.data = suppliersData || [];
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }
    }, [product]);

    const handleInputChange = (field: string, value: string | number) => {
        productFormState.editFormData = {
            ...productFormState.editFormData,
            [field]: value,
        };
    };

    const handleSubmit = async () => {
        if (!product) return;

        productFormState.loading = true;
        try {
            let category = formSnap.editFormData.category?.trim() || undefined;
            let supplier = formSnap.editFormData.supplier?.trim() || undefined;

            // Check if category is new (not in existing list)
            if (category) {
                const categoryExists = categoriesSnap.data.some(
                    (cat) => cat.title.toLowerCase() === category?.toLowerCase()
                );
                if (!categoryExists) {
                    // Create new category
                    try {
                        const newCategory = await addCategory({ title: category } as any);
                        // Refresh categories list
                        const categoriesData = await getCategories();
                        categoriesState.data = categoriesData || [];
                        toast.success(newCategory.message);
                    } catch (error: any) {
                        console.error("Error creating category:", error);
                        toast.error(error.message || "კატეგორიის შექმნა ვერ მოხერხდა");
                        productFormState.loading = false;
                        return;
                    }
                }
            }

            // Check if supplier is new (not in existing list)
            if (supplier) {
                const supplierExists = suppliersSnap.data.some(
                    (sup) => sup.title.toLowerCase() === supplier?.toLowerCase()
                );
                if (!supplierExists) {
                    // Create new supplier
                    try {
                        const newSupplier = await addSupplier({ title: supplier } as any);
                        // Refresh suppliers list
                        const suppliersData = await getSuppliers();
                        suppliersState.data = suppliersData || [];
                        toast.success(newSupplier.message);
                    } catch (error: any) {
                        console.error("Error creating supplier:", error);
                        toast.error(error.message || "მომწოდებლის შექმნა ვერ მოხერხდა");
                        productFormState.loading = false;
                        return;
                    }
                }
            }

            const productData: Partial<Product> = {
                _id: product._id,
                title: formSnap.editFormData.title,
                category: category,
                supplier: supplier,
                total_quantity: formSnap.editFormData.total_quantity,
                quantity: formSnap.editFormData.quantity,
                unit_cost: formSnap.editFormData.unit_cost,
                unit_price: formSnap.editFormData.unit_price,
                comment: formSnap.editFormData.comment || undefined,
            };

            const response = await editProduct(productData as Product);

            if (response && response.data) {
                toast.success(response.message);
                onSuccess();
            }
        } catch (error: any) {
            console.error("Error updating product:", error);
            toast.error(error.response?.data?.message || error.message);
        } finally {
            productFormState.loading = false;
            onClose(); // Always close modal and refetch data
        }
    };

    const handleDeleteCategory = async () => {
        if (!modalState.categoryToDelete) return;

        try {
            const response = await deleteCategory(modalState.categoryToDelete._id);
            toast.success(response.message);
            
            // Refresh categories
            const categoriesData = await getCategories();
            categoriesState.data = categoriesData || [];
            
            // Clear the selected category if it was deleted
            if (formSnap.editFormData.category === modalState.categoryToDelete.title) {
                productFormState.editFormData.category = "";
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.deleteCategory = false;
            modalState.categoryToDelete = null;
        }
    };

    const handleDeleteSupplier = async () => {
        if (!modalState.supplierToDelete) return;

        try {
            const response = await deleteSupplier(modalState.supplierToDelete._id);
            toast.success(response.message);
            
            // Refresh suppliers
            const suppliersData = await getSuppliers();
            suppliersState.data = suppliersData || [];
            
            // Clear the selected supplier if it was deleted
            if (formSnap.editFormData.supplier === modalState.supplierToDelete.title) {
                productFormState.editFormData.supplier = "";
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.deleteSupplier = false;
            modalState.supplierToDelete = null;
        }
    };

    const closeCategoryDeleteModal = () => {
        modalState.deleteCategory = false;
        modalState.categoryToDelete = null;
    };

    const closeSupplierDeleteModal = () => {
        modalState.deleteSupplier = false;
        modalState.supplierToDelete = null;
    };

    if (!isOpen || !product) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="პროდუქტის რედაქტირება"
            size="xl"
            actionButtons={{
                primary: {
                    title: "განახლება",
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
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="bg-[var(--color-bg-light)] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[var(--color-black)] mb-3">
                        ძირითადი ინფორმაცია
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label={ProductEnum.TITLE}
                            value={formSnap.editFormData.title}
                            onChange={(value: string) =>
                                handleInputChange("title", value)
                            }
                        />

                        <Input
                            label={ProductEnum.COMMENT}
                            value={formSnap.editFormData.comment}
                            onChange={(value: string) =>
                                handleInputChange("comment", value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Combobox
                            label={ProductEnum.CATEGORY}
                            value={formSnap.editFormData.category}
                            onChange={(value: string) =>
                                handleInputChange("category", value)
                            }
                            options={categoriesSnap.data as readonly { readonly _id: number | string; readonly title: string }[]}
                            placeholder={`აირჩიეთ ან შეიყვანეთ ${ProductEnum.CATEGORY.toLowerCase()}`}
                            modalKey="categorySelector"
                            type="category"
                            onDelete={() => {}} // Handled by modalState
                        />

                        <Combobox
                            label={ProductEnum.SUPPLIER}
                            value={formSnap.editFormData.supplier}
                            onChange={(value: string) =>
                                handleInputChange("supplier", value)
                            }
                            options={suppliersSnap.data as readonly { readonly _id: number | string; readonly title: string }[]}
                            placeholder={`აირჩიეთ ან შეიყვანეთ ${ProductEnum.SUPPLIER.toLowerCase()}`}
                            modalKey="supplierSelector"
                            type="supplier"
                            onDelete={() => {}} // Handled by modalState
                        />
                    </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-[var(--color-bg-light)] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[var(--color-black)] mb-3">
                        ფასები
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={`${ProductEnum.UNIT_COST} (₾)`}
                            type="number"
                            value={formSnap.editFormData.unit_cost}
                            onChange={(value: string) =>
                                handleInputChange("unit_cost", Number(value))
                            }
                            step="0.01"
                        />

                        <Input
                            label={`${ProductEnum.UNIT_PRICE} (₾)`}
                            type="number"
                            value={formSnap.editFormData.unit_price}
                            onChange={(value: string) =>
                                handleInputChange("unit_price", Number(value))
                            }
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Quantity Information */}
                <div className="bg-[var(--color-bg-light)] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[var(--color-black)] mb-3">
                        რაოდენობა
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={ProductEnum.TOTAL_QUANTITY}
                            type="number"
                            value={formSnap.editFormData.total_quantity}
                            onChange={(value: string) =>
                                handleInputChange(
                                    "total_quantity",
                                    Number(value)
                                )
                            }
                            min="0"
                        />
                        <Input
                            label={ProductEnum.QUANTITY}
                            type="number"
                            value={formSnap.editFormData.quantity}
                            onChange={(value: string) =>
                                handleInputChange("quantity", Number(value))
                            }
                            min="0"
                        />
                    </div>
                </div>

                {/* Financial Calculations */}
                <div className="bg-[var(--color-bg-light)] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-[var(--color-black)] mb-3">
                        ფინანსური კალკულატორი
                    </h3>

                    {/* Row 1: Total Price - Total Cost - Current Total Cost */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.TOTAL_PRICE}
                            </label>
                            <input
                                type="text"
                                value={`${(
                                    formSnap.editFormData.quantity *
                                    formSnap.editFormData.unit_price
                                ).toLocaleString()} ₾`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.TOTAL_COST}
                            </label>
                            <input
                                type="text"
                                value={`${(
                                    formSnap.editFormData.quantity *
                                    formSnap.editFormData.unit_cost
                                ).toLocaleString()} ₾`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.CURRENT_TOTAL_COST}
                            </label>
                            <input
                                type="text"
                                value={`${(
                                    formSnap.editFormData.quantity *
                                    formSnap.editFormData.unit_cost
                                ).toLocaleString()} ₾`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                    </div>

                    {/* Row 2: Unit Profit - Total Profit - Profit Percentage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.UNIT_PROFIT}
                            </label>
                            <input
                                type="text"
                                value={`${(
                                    formSnap.editFormData.unit_price -
                                    formSnap.editFormData.unit_cost
                                ).toLocaleString()} ₾`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.TOTAL_PROFIT}
                            </label>
                            <input
                                type="text"
                                value={`${(
                                    formSnap.editFormData.quantity *
                                        formSnap.editFormData.unit_price -
                                    formSnap.editFormData.quantity *
                                        formSnap.editFormData.unit_cost
                                ).toLocaleString()} ₾`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-black)] mb-1">
                                {ProductEnum.PROFIT_PERCENTAGE}
                            </label>
                            <input
                                type="text"
                                value={`${
                                    formSnap.editFormData.unit_cost > 0
                                        ? (
                                              ((formSnap.editFormData
                                                  .unit_price -
                                                  formSnap.editFormData
                                                      .unit_cost) /
                                                  formSnap.editFormData
                                                      .unit_cost) *
                                              100
                                          ).toFixed(2)
                                        : "0.00"
                                }%`}
                                disabled
                                className="text-sm text-[var(--color-gray)] bg-[var(--color-bg-light)] px-3 py-2 rounded border border-[var(--color-gray)] cursor-not-allowed w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Delete Confirmation Modal */}
            <Modal
                isOpen={modalSnap.deleteCategory}
                onClose={closeCategoryDeleteModal}
                title="ყურადღება"
                size="md"
                actionButtons={{
                    primary: {
                        title: "დიახ",
                        onClick: handleDeleteCategory,
                        type: "red",
                    },
                    secondary: {
                        title: "გაუქმება",
                        onClick: closeCategoryDeleteModal,
                        type: "white",
                    },
                }}
            >
                <div className="text-center py-4">
                    <p className="text-[var(--color-black)]">
                        დარწმუნებული ხართ რომ გსურთ ამ კატეგორიის წაშლა?
                    </p>
                </div>
            </Modal>

            {/* Supplier Delete Confirmation Modal */}
            <Modal
                isOpen={modalSnap.deleteSupplier}
                onClose={closeSupplierDeleteModal}
                title="ყურადღება"
                size="md"
                actionButtons={{
                    primary: {
                        title: "დიახ",
                        onClick: handleDeleteSupplier,
                        type: "red",
                    },
                    secondary: {
                        title: "გაუქმება",
                        onClick: closeSupplierDeleteModal,
                        type: "white",
                    },
                }}
            >
                <div className="text-center py-4">
                    <p className="text-[var(--color-black)]">
                        დარწმუნებული ხართ რომ გსურთ ამ მომწოდებლის წაშლა?
                    </p>
                </div>
            </Modal>
        </Modal>
    );
};
