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
import { QuickGiftModal } from "../components/table/modals/quickGiftModal";
import { QuickReturnModal } from "../components/table/modals/quickReturnModal";
import { Modal } from "../components/layout/Modal";
import { Product } from "../types/products";
import { Delete } from "../enums/confirmation";
import * as XLSX from "xlsx";
import { Product as ProductEnum } from "../enums/button";

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const snap = useSnapshot(productsState);
    const tableSnap = useSnapshot(tableState);
    const modalSnap = useSnapshot(modalState);

    const addProduct = () => {
        modalState.addProduct = true;
    };

    const exportToExcel = async () => {
        try {
            // Get current filters from URL
            const searchParams = new URLSearchParams(location.search);

            // Remove pagination params and set a high limit to get all data
            searchParams.delete("page");
            searchParams.delete("limit");
            searchParams.set("limit", "10000"); // Get all products

            const queryString = `?${searchParams.toString()}`;

            // Fetch all products with current filters
            const productsData = await getProducts(queryString);

            if (
                !productsData ||
                !productsData.data ||
                productsData.data.length === 0
            ) {
                toast.error("ექსპორტირებისთვის მონაცემები არ მოიძებნა");
                return;
            }

            // Map products to Excel format with display names
            const excelData = productsData.data.map((product: Product) => {
                // Format date
                let formattedDate = "";
                if (product.createdAt) {
                    try {
                        const date = new Date(product.createdAt);
                        if (!isNaN(date.getTime())) {
                            const day = date
                                .getDate()
                                .toString()
                                .padStart(2, "0");
                            const month = (date.getMonth() + 1)
                                .toString()
                                .padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = date
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                            const minutes = date
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                            const seconds = date
                                .getSeconds()
                                .toString()
                                .padStart(2, "0");
                            formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                        }
                    } catch (error) {
                        formattedDate = "";
                    }
                }

                return {
                    [productsColumns.displayNames._id]: product._id,
                    [productsColumns.displayNames.title]: product.title || "",
                    [productsColumns.displayNames.category]:
                        product.category || "",
                    [productsColumns.displayNames.supplier]:
                        product.supplier || "",
                    [productsColumns.displayNames.createdAt]: formattedDate,
                    [productsColumns.displayNames.quantity]:
                        product.quantity || 0,
                    [productsColumns.displayNames.unit_price]:
                        product.unit_price || 0,
                    [productsColumns.displayNames.comment]:
                        product.comment || "",
                };
            });

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "პროდუქტები");

            // Generate filename with current date
            const date = new Date();
            const dateStr = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
            const filename = `პროდუქტები_${dateStr}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);
            toast.success("Excel ფაილი წარმატებით ჩამოიტვირთა");
        } catch (error: any) {
            console.error("Error exporting to Excel:", error);
            toast.error(
                error.message || "Excel ფაილის ექსპორტირება ვერ მოხერხდა",
            );
        }
    };

    const handleEditProduct = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.editProduct = true;
    };

    const handleQuickSell = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.sellProduct = true;
    };

    const handleGift = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.giftProduct = true;
    };

    const handleReturn = (product: Product) => {
        tableState.selectedProduct = product;
        modalState.returnProduct = true;
    };

    const handleDeleteProduct = (product: Product) => {
        modalState.productToDelete = product;
        modalState.deleteProduct = true;
    };

    const confirmDelete = async () => {
        if (!modalState.productToDelete) return;

        try {
            const response = await deleteProduct(
                modalState.productToDelete._id,
            );
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
            },
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
                <div className="flex gap-4 mb-5">
                    <div className="w-[180px]">
                        <Button
                            title={ProductEnum.PRODUCT_ADD}
                            onClick={addProduct}
                            type="gold"
                            customClasses="text-[var(--color-black)] border-[var(--color-black)] border"
                        />
                    </div>
                    <div className="w-[180px]">
                        <Button
                            title={ProductEnum.EXCEL}
                            onClick={exportToExcel}
                            type="gold"
                            customClasses="bg-[var(--color-excel)] hover:opacity-90 text-white"
                        />
                    </div>
                    <div className="w-[180px]">
                        <Button
                            title={ProductEnum.DELETED_PRODUCTS}
                            onClick={() => navigate("/products/deleted")}
                            type="white"
                            customClasses=""
                        />
                    </div>
                </div>

                <Table
                    data={productsState.data}
                    loading={snap.loading}
                    columns={productsColumns}
                    onEdit={handleEditProduct}
                    onQuickSell={handleQuickSell}
                    onGift={handleGift}
                    onReturn={handleReturn}
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

                <QuickGiftModal
                    product={tableSnap.selectedProduct}
                    isOpen={modalSnap.giftProduct}
                    onClose={() => {
                        modalState.giftProduct = false;
                        tableState.selectedProduct = null;
                        handleModalClose();
                    }}
                    onSuccess={handleEditSuccess}
                />

                <QuickReturnModal
                    product={tableSnap.selectedProduct}
                    isOpen={modalSnap.returnProduct}
                    onClose={() => {
                        modalState.returnProduct = false;
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
                            {Delete.DELETE_PRODUCT}
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
