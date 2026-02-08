import { useNavigate, useLocation } from "react-router";
import Nav from "../components/layout/nav";
import { useEffect } from "react";
import { Table } from "../components/table/table";
import { Button } from "../components/Button";
import { getProducts, deleteProduct } from "../actions/products";
import { useSnapshot } from "valtio";
import { productsState, tableState, modalState } from "../states";
import { productsColumns } from "../types/table";
import { toast } from "react-toastify";
import { EditProductModal } from "../components/table/modals/editProductModal";
import { AddProductModal } from "../components/table/modals/addProductModal";
import { QuickSellModal } from "../components/table/modals/quickSellModal";
import { Modal } from "../components/layout/Modal";
import { Product } from "../types/products";

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const snap = useSnapshot(productsState);
    const tableSnap = useSnapshot(tableState);
    const modalSnap = useSnapshot(modalState);

    const addProduct = () => {
        modalState.addProduct = true;
    };

    const handleEditProduct = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.editProduct = true;
    };

    const handleQuickSell = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.sellProduct = true;
    };

    const handleDeleteProduct = (product: Product) => {
        modalState.productToDelete = product;
        modalState.deleteProduct = true;
    };

    const confirmDelete = async () => {
        if (!modalState.productToDelete) return;

        try {
            const response = await deleteProduct(modalState.productToDelete._id);
            toast.success(response.message);
            fetchProducts(); // Refresh the table
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.deleteProduct = false;
            modalState.productToDelete = null;
        }
    };

    const closeDeleteModal = () => {
        modalState.deleteProduct = false;
        modalState.productToDelete = null;
    };

    const handleEditSuccess = () => {
        // Refresh the current page to show updated data
        const searchParams = new URLSearchParams(location.search);
        const currentPage = searchParams.get("page") || "1";
        const currentLimit = searchParams.get("limit") || "10";

        // Trigger a page refresh by navigating to the same URL
        navigate(
            `${location.pathname}?page=${currentPage}&limit=${currentLimit}`,
            {
                replace: true,
            }
        );
    };

    const handleModalClose = () => {
        // Always refetch data when modal closes
        fetchProducts();
    };

    const fetchProducts = async () => {
        productsState.loading = true;
        try {
            const searchParams = new URLSearchParams(location.search);

            if (!searchParams.has("page")) {
                searchParams.set("page", "1");
            }
            if (!searchParams.has("limit")) {
                searchParams.set("limit", "10");
            }

            const queryString = `?${searchParams.toString()}`;

            const products = await getProducts(queryString);

            if (products && products.data) {
                productsState.data = products;
            } else {
                productsState.data = {
                    data: [],
                    pagination: {
                        currentPage: 1,
                        totalPages: 1,
                        totalCount: 0,
                        limit: 10,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                };
            }
        } catch (error: any) {
            toast.error(error.message);
            productsState.data = {
                data: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalCount: 0,
                    limit: 10,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            };
        } finally {
            productsState.loading = false;
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [location.search]);

    return (
        <div className="flex flex-col gap-5 ">
            <Nav />
            <div className="overflow-hidden mx-5">
                <div className="w-[180px]">
                    <Button
                        title="პროდუქტის დამატება"
                        onClick={addProduct}
                        type="gold"
                        customClasses="text-[var(--color-black)] border-[var(--color-black)] border"
                    />
                </div>

                <Table
                    data={productsState.data}
                    loading={snap.loading}
                    columns={productsColumns}
                    onEdit={handleEditProduct}
                    onQuickSell={handleQuickSell}
                    onDelete={handleDeleteProduct}
                />

                <AddProductModal
                    isOpen={modalSnap.addProduct}
                    onClose={() => {
                        modalState.addProduct = false;
                        handleModalClose();
                    }}
                    onSuccess={handleEditSuccess}
                />

                <EditProductModal
                    product={tableSnap.selectedProduct}
                    isOpen={modalSnap.editProduct}
                    onClose={() => {
                        modalState.editProduct = false;
                        tableState.selectedProduct = null;
                        handleModalClose();
                    }}
                    onSuccess={handleEditSuccess}
                />

                <QuickSellModal
                    product={tableSnap.selectedProduct}
                    isOpen={modalSnap.sellProduct}
                    onClose={() => {
                        modalState.sellProduct = false;
                        tableState.selectedProduct = null;
                        handleModalClose();
                    }}
                    onSuccess={handleEditSuccess}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.deleteProduct}
                    onClose={closeDeleteModal}
                    title="ყურადღება"
                    size="md"
                    actionButtons={{
                        primary: {
                            title: "დიახ",
                            onClick: confirmDelete,
                            type: "red",
                        },
                        secondary: {
                            title: "გაუქმება",
                            onClick: closeDeleteModal,
                            type: "white",
                        },
                    }}
                >
                    <div className="text-center py-4">
                        <p className="text-[var(--color-black)]">
                            დარწმუნებული ხართ რომ გსურთ ამ პროდუქტის წაშლა
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
