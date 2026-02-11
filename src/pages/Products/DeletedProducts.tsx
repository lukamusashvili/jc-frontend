import { useNavigate, useLocation } from "react-router";
import Nav from "../../components/layout/nav";
import { useEffect } from "react";
import { Table } from "../../components/table/table";
import { Button } from "../../components/Button";
import { getDeletedProducts, restoreProduct, permanentDeleteProduct } from "../../actions/products";
import { useSnapshot } from "valtio";
import { productsState, tableState, modalState } from "../../states";
import { productsColumns } from "../../types/table";
import { toast } from "react-toastify";
import { Modal } from "../../components/layout/Modal";
import { Product } from "../../types/products";

export default function DeletedProducts() {
    const navigate = useNavigate();
    const location = useLocation();
    const snap = useSnapshot(productsState);
    const modalSnap = useSnapshot(modalState);

    const handleRestore = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.restoreProduct = true;
    };

    const handlePermanentDelete = (product: Product) => {
        modalState.productToDelete = product;
        modalState.permanentDeleteProduct = true;
    };

    const confirmRestore = async () => {
        if (!tableState.selectedProduct) return;

        try {
            const response = await restoreProduct(tableState.selectedProduct._id);
            toast.success(response.message);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.restoreProduct = false;
            tableState.selectedProduct = null;
        }
    };

    const closeRestoreModal = () => {
        modalState.restoreProduct = false;
        tableState.selectedProduct = null;
    };

    const confirmPermanentDelete = async () => {
        if (!modalState.productToDelete) return;

        try {
            const response = await permanentDeleteProduct(modalState.productToDelete._id);
            toast.success(response.message);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.permanentDeleteProduct = false;
            modalState.productToDelete = null;
        }
    };

    const closePermanentDeleteModal = () => {
        modalState.permanentDeleteProduct = false;
        modalState.productToDelete = null;
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

            const products = await getDeletedProducts(queryString);

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

    // Custom columns with restore and delete actions
    const deletedProductsColumns = {
        ...productsColumns,
    };

    return (
        <div className="flex flex-col gap-5">
            <Nav />
            <div className="overflow-hidden mx-5">
                <div className="w-[180px] mb-5">
                    <Button
                        title="უკან"
                        onClick={() => navigate("/")}
                        type="white"
                        customClasses=""
                    />
                </div>

                <Table
                    data={productsState.data}
                    loading={snap.loading}
                    columns={deletedProductsColumns}
                    onRestore={(item) => handleRestore(item as Product)}
                    onPermanentDelete={(item) => handlePermanentDelete(item as Product)}
                />

                {/* Restore Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.restoreProduct}
                    onClose={closeRestoreModal}
                    title="ყურადღება"
                    size="md"
                    actionButtons={{
                        primary: {
                            title: "დიახ",
                            onClick: confirmRestore,
                            type: "gold",
                        },
                        secondary: {
                            title: "გაუქმება",
                            onClick: closeRestoreModal,
                            type: "white",
                        },
                    }}
                >
                    <div className="text-center py-4">
                        <p className="text-[var(--color-black)]">
                            დარწმუნებული ხართ რომ გსურთ ამ პროდუქტის აღდგენა?
                        </p>
                    </div>
                </Modal>

                {/* Permanent Delete Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.permanentDeleteProduct}
                    onClose={closePermanentDeleteModal}
                    title="ყურადღება"
                    size="md"
                    actionButtons={{
                        primary: {
                            title: "დიახ",
                            onClick: confirmPermanentDelete,
                            type: "red",
                        },
                        secondary: {
                            title: "გაუქმება",
                            onClick: closePermanentDeleteModal,
                            type: "white",
                        },
                    }}
                >
                    <div className="text-center py-4">
                        <p className="text-[var(--color-black)]">
                            დარწმუნებული ხართ რომ გსურთ ამ პროდუქტის მუდმივად წაშლა? ეს მოქმედება შეუქცევადია!
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
