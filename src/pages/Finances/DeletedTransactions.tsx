import { useLocation, useParams, useNavigate } from "react-router";
import Nav from "../../components/layout/nav";
import { useEffect } from "react";
import { Table } from "../../components/table/table";
import { useSnapshot } from "valtio";
import { transactionsState, modalState, productsState } from "../../states";
import { transactionsColumns } from "../../types/table";
import { toast } from "react-toastify";
import { Modal } from "../../components/layout/Modal";
import { Transaction } from "../../types/finances";
import {
    getDeletedTransactions,
    restoreTransaction,
    permanentDeleteTransaction,
} from "../../actions/transactions";
import { getProducts } from "../../actions/products";
import { Button } from "../../components/Button";

export default function DeletedTransactions() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const snap = useSnapshot(transactionsState);
    const modalSnap = useSnapshot(modalState);
    const productsSnap = useSnapshot(productsState);

    const handleRestore = (transaction: Transaction) => {
        modalState.transactionToEdit = transaction;
        modalState.restoreTransaction = true;
    };

    const handlePermanentDelete = (transaction: Transaction) => {
        modalState.transactionToPermanentDelete = transaction;
        modalState.permanentDeleteTransaction = true;
    };

    const confirmRestore = async () => {
        if (!modalState.transactionToEdit) return;

        try {
            const response = await restoreTransaction(modalState.transactionToEdit._id);
            toast.success(response.message);
            fetchTransactions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.restoreTransaction = false;
            modalState.transactionToEdit = null;
        }
    };

    const closeRestoreModal = () => {
        modalState.restoreTransaction = false;
        modalState.transactionToEdit = null;
    };

    const confirmPermanentDelete = async () => {
        if (!modalState.transactionToPermanentDelete) return;

        try {
            const response = await permanentDeleteTransaction(
                modalState.transactionToPermanentDelete._id
            );
            toast.success(response.message);
            fetchTransactions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            modalState.permanentDeleteTransaction = false;
            modalState.transactionToPermanentDelete = null;
        }
    };

    const closePermanentDeleteModal = () => {
        modalState.permanentDeleteTransaction = false;
        modalState.transactionToPermanentDelete = null;
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

            const transactions = await getDeletedTransactions(id, queryString);

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
                <div className="w-[190px] mb-5">
                    <Button
                        title="უკან"
                        onClick={() => navigate(`/finances/${id}`)}
                        type="white"
                        customClasses=""
                    />
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
                    }}
                    loading={snap.loading}
                    columns={transactionsColumns}
                    onRestore={(item) => {
                        const originalTransaction = snap.data.data.find(
                            (t) => t._id === item._id,
                        );
                        if (originalTransaction) {
                            handleRestore(originalTransaction);
                        }
                    }}
                    onPermanentDelete={(item) => {
                        const originalTransaction = snap.data.data.find(
                            (t) => t._id === item._id,
                        );
                        if (originalTransaction) {
                            handlePermanentDelete(originalTransaction);
                        }
                    }}
                />

                {/* Restore Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.restoreTransaction}
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
                            დარწმუნებული ხართ რომ გსურთ ამ ტრანზაქციის აღდგენა?
                        </p>
                    </div>
                </Modal>

                {/* Permanent Delete Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.permanentDeleteTransaction}
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
                            დარწმუნებული ხართ რომ გსურთ ამ ტრანზაქციის მუდმივად წაშლა? ეს მოქმედება შეუქცევადია!
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
