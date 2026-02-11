import { useLocation, useParams } from "react-router";
import Nav from "../../components/layout/nav";
import { useEffect, useState } from "react";
import { Table } from "../../components/table/table";
import { useSnapshot } from "valtio";
import { transactionsState, modalState, productsState } from "../../states";
import { transactionsColumns } from "../../types/table";
import { toast } from "react-toastify";
import { Modal } from "../../components/layout/Modal";
import { Transaction } from "../../types/finances";
import {
    getTransactions,
    deleteTransaction,
    getTransactionsSum,
} from "../../actions/transactions";
import { getProducts } from "../../actions/products";
import { Button } from "../../components/Button";
import { Transaction as TransactionButtonEnum } from "../../enums/button";
import { AddTransactionModal } from "../../components/table/modals/addTransactionModal";
import { EditTransactionModal } from "../../components/table/modals/editTransactionModal";
import { Delete } from "../../enums/confirmation";
import * as XLSX from "xlsx";
import { TransactionType, TransactionTypeDisplay } from "../../enums/transactions";
import { Transaction as TransactionEnum } from "../../enums/button";
import { useNavigate } from "react-router";

export default function WalletTransactions() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const snap = useSnapshot(transactionsState);
    const modalSnap = useSnapshot(modalState);
    const productsSnap = useSnapshot(productsState);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const handleAddTransaction = () => {
        modalState.addTransaction = true;
    };

    const exportToExcel = async () => {
        if (!id) {
            toast.error("Wallet ID is missing");
            return;
        }

        try {
            // Get current filters from URL
            const searchParams = new URLSearchParams(location.search);
            
            // Remove pagination params and set a high limit to get all data
            searchParams.delete("page");
            searchParams.delete("limit");
            searchParams.set("limit", "10000"); // Get all transactions
            
            const queryString = `?${searchParams.toString()}`;
            
            // Fetch all transactions with current filters
            const transactionsData = await getTransactions(id, queryString);
            
            if (!transactionsData || !transactionsData.data || transactionsData.data.length === 0) {
                toast.error("ექსპორტირებისთვის მონაცემები არ მოიძებნა");
                return;
            }

            // Fetch products if not already loaded (for product title mapping)
            if (productsState.data.data.length === 0) {
                try {
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
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            }

            // Map transactions to Excel format with display names
            const excelData = transactionsData.data.map((transaction: Transaction) => {
                // Format date
                let formattedDate = "";
                if (transaction.created_at) {
                    try {
                        const date = new Date(transaction.created_at);
                        if (!isNaN(date.getTime())) {
                            const day = date.getDate().toString().padStart(2, "0");
                            const month = (date.getMonth() + 1).toString().padStart(2, "0");
                            const year = date.getFullYear();
                            const hours = date.getHours().toString().padStart(2, "0");
                            const minutes = date.getMinutes().toString().padStart(2, "0");
                            const seconds = date.getSeconds().toString().padStart(2, "0");
                            formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                        }
                    } catch (error) {
                        formattedDate = "";
                    }
                }

                // Format type
                let formattedType = "";
                if (transaction.type === TransactionType.IN) {
                    formattedType = TransactionTypeDisplay.IN;
                } else if (transaction.type === TransactionType.OUT) {
                    formattedType = TransactionTypeDisplay.OUT;
                }

                // Format product (get title from products)
                let formattedProduct = "";
                if (transaction.product) {
                    const product = productsState.data.data.find(
                        (p) => p._id.toString() === transaction.product
                    );
                    if (product) {
                        formattedProduct = `${product.title} (N: ${product._id})`;
                    } else {
                        formattedProduct = `N: ${transaction.product}`;
                    }
                }

                return {
                    [transactionsColumns.displayNames._id]: transaction._id,
                    [transactionsColumns.displayNames.title]: transaction.title || "",
                    [transactionsColumns.displayNames.created_at]: formattedDate,
                    [transactionsColumns.displayNames.type]: formattedType,
                    [transactionsColumns.displayNames.amount]: transaction.amount || 0,
                    [transactionsColumns.displayNames.product]: formattedProduct,
                    [transactionsColumns.displayNames.comment]: transaction.comment || "",
                };
            });

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ტრანზაქციები");

            // Generate filename with current date
            const date = new Date();
            const dateStr = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
            const filename = `ტრანზაქციები_${dateStr}.xlsx`;

            // Download file
            XLSX.writeFile(wb, filename);
            toast.success("Excel ფაილი წარმატებით ჩამოიტვირთა");
        } catch (error: any) {
            console.error("Error exporting to Excel:", error);
            toast.error(error.message || "Excel ფაილის ექსპორტირება ვერ მოხერხდა");
        }
    };

    const handleEditTransaction = (transaction: Transaction) => {
        modalState.transactionToEdit = transaction;
        modalState.editTransaction = true;
    };

    const handleModalClose = () => {
        fetchTransactions();
    };

    const handleDeleteTransaction = (transaction: Transaction) => {
        modalState.transactionToDelete = transaction;
        modalState.deleteTransaction = true;
    };

    const confirmDelete = async () => {
        if (!modalState.transactionToDelete) return;

        try {
            const response = await deleteTransaction(
                modalState.transactionToDelete._id,
            );
            toast.success(response.message);
            fetchTransactions(); // Refresh the table
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "შეცდომა მოხდა",
            );
        } finally {
            modalState.deleteTransaction = false;
            modalState.transactionToDelete = null;
        }
    };

    const closeDeleteModal = () => {
        modalState.deleteTransaction = false;
        modalState.transactionToDelete = null;
    };

    const fetchTransactions = async () => {
        if (!id) return;

        transactionsState.loading = true;
        try {
            const searchParams = new URLSearchParams(location.search);

            if (!searchParams.has("page")) {
                searchParams.set("page", "1");
            }
            if (!searchParams.has("limit")) {
                searchParams.set("limit", "10");
            }

            const queryString = `?${searchParams.toString()}`;

            // Fetch products if not already loaded
            if (productsState.data.data.length === 0) {
                try {
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
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            }

            const [transactions, sum] = await Promise.all([
                getTransactions(id, queryString),
                getTransactionsSum(id, queryString),
            ]);

            if (transactions && transactions.data) {
                transactionsState.data = transactions;
            } else {
                transactionsState.data = {
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

            setTotalAmount(sum);
        } catch (error: any) {
            toast.error(error.message);
            transactionsState.data = {
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
            setTotalAmount(0);
        } finally {
            transactionsState.loading = false;
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [location.search, id]);

    return (
        <div className="flex flex-col gap-5">
            <Nav />
            <div className="overflow-hidden mx-5">
                <div className="flex gap-4 mb-5">
                    <div className="w-[190px]">
                        <Button
                            title={TransactionButtonEnum.TRANSACTION_ADD}
                            onClick={handleAddTransaction}
                            type="gold"
                            customClasses="text-[var(--color-black)] border-[var(--color-black)] border"
                        />
                    </div>
                    <div className="w-[190px]">
                        <Button
                            title={TransactionEnum.EXCEL}
                            onClick={exportToExcel}
                            type="gold"
                            customClasses="bg-[var(--color-excel)] hover:opacity-90 text-white"
                        />
                    </div>
                    <div className="w-[190px]">
                        <Button
                            title={TransactionEnum.DELETED_TRANSACTIONS}
                            onClick={() => navigate(`/finances/${id}/deleted`)}
                            type="white"
                            customClasses=""
                        />
                    </div>
                </div>

                <Table
                    data={{
                        ...snap.data,
                        data: [...snap.data.data].map((transaction) => {
                            // Format product field to show title and ID for display only
                            if (transaction.product) {
                                const product = productsSnap.data.data.find(
                                    (p) =>
                                        p._id.toString() ===
                                        transaction.product,
                                );
                                if (product) {
                                    return {
                                        ...transaction,
                                        product: `${product.title} (N: ${product._id})`,
                                    };
                                }
                            }
                            return transaction;
                        }),
                        totalAmount: totalAmount,
                    }}
                    loading={snap.loading}
                    columns={transactionsColumns}
                    onEdit={(item) => {
                        // Find original transaction from snap.data.data to preserve product ID
                        const originalTransaction = snap.data.data.find(
                            (t) => t._id === item._id,
                        );
                        if (originalTransaction) {
                            handleEditTransaction(originalTransaction);
                        }
                    }}
                    onDelete={handleDeleteTransaction}
                />

                <AddTransactionModal
                    isOpen={modalSnap.addTransaction}
                    onClose={() => {
                        modalState.addTransaction = false;
                        handleModalClose();
                    }}
                    onSuccess={handleModalClose}
                />

                <EditTransactionModal
                    transaction={modalSnap.transactionToEdit}
                    isOpen={modalSnap.editTransaction}
                    onClose={() => {
                        modalState.editTransaction = false;
                        modalState.transactionToEdit = null;
                        handleModalClose();
                    }}
                    onSuccess={handleModalClose}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.deleteTransaction}
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
                            {Delete.DELETE_TRANSACTION}
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
