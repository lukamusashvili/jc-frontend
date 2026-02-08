import { useLocation, useParams } from "react-router";
import Nav from "../../components/layout/nav";
import { useEffect, useState } from "react";
import { Table } from "../../components/table/table";
import { useSnapshot } from "valtio";
import { transactionsState, modalState } from "../../states";
import { transactionsColumns } from "../../types/table";
import { toast } from "react-toastify";
import { Modal } from "../../components/layout/Modal";
import { Transaction } from "../../types/finances";
import { getTransactions, deleteTransaction, getTransactionsSum } from "../../actions/transactions";
import { Button } from "../../components/Button";
import { Transaction as TransactionButtonEnum } from "../../enums/button";
import { AddTransactionModal } from "../../components/table/modals/addTransactionModal";
import { EditTransactionModal } from "../../components/table/modals/editTransactionModal";

export default function WalletTransactions() {
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const snap = useSnapshot(transactionsState);
    const modalSnap = useSnapshot(modalState);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    const handleAddTransaction = () => {
        modalState.addTransaction = true;
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
                modalState.transactionToDelete._id
            );
            toast.success(response.message);
            fetchTransactions(); // Refresh the table
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || error.message || "შეცდომა მოხდა"
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
                <div className="w-[190px] mb-5">
                    <Button
                        title={TransactionButtonEnum.TRANSACTION_ADD}
                        onClick={handleAddTransaction}
                        type="gold"
                        customClasses="text-[var(--color-black)] border-[var(--color-black)] border"
                    />
                </div>

                <Table
                    data={{
                        ...snap.data,
                        data: [...snap.data.data], // keep original type, avoid mapping enum type for Table prop
                        totalAmount: totalAmount,
                    }}
                    loading={snap.loading}
                    columns={transactionsColumns}
                    onEdit={handleEditTransaction}
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
                            დარწმუნებული ხართ რომ გსურთ ამ ტრანზაქციის წაშლა
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
