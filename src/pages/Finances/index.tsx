import { useEffect } from "react";
import { useNavigate } from "react-router";
import Nav from "../../components/layout/nav";
import { useSnapshot } from "valtio";
import { walletsState, modalState, walletFormState } from "../../states";
import { getWallets, deleteWallet } from "../../actions/wallets";
import { WalletModal } from "../../components/finances/WalletModal";
import { Modal } from "../../components/layout/Modal";
import { toast } from "react-toastify";
import { Wallet } from "../../types/finances";
import { EditFilled, DeleteFilled, PlusOutlined } from "@ant-design/icons";
import { Delete } from "../../enums/confirmation";

export default function Finances() {
    const navigate = useNavigate();
    const snap = useSnapshot(walletsState);
    const modalSnap = useSnapshot(modalState);

    const fetchWallets = async () => {
        walletsState.loading = true;
        try {
            const walletsData = await getWallets();
            walletsState.data = walletsData || [];
        } catch (error: any) {
            toast.error(error.message || "მონაცემების ჩატვირთვა ვერ მოხერხდა");
        } finally {
            walletsState.loading = false;
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    const handleAddWallet = () => {
        walletFormState.wallet = null;
        modalState.walletModal = true;
    };

    const handleEditWallet = (wallet: Wallet) => {
        walletFormState.wallet = wallet;
        modalState.walletModal = true;
    };

    const handleDeleteWallet = (wallet: Wallet) => {
        modalState.walletToDelete = wallet;
        modalState.deleteWallet = true;
    };

    const confirmDelete = async () => {
        if (!modalState.walletToDelete) return;

        try {
            const response = await deleteWallet(modalState.walletToDelete._id);
            toast.success(response.message || "საფულე წარმატებით წაიშალა");
            fetchWallets(); // Refresh the list
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "შეცდომა მოხდა"
            );
        } finally {
            modalState.deleteWallet = false;
            modalState.walletToDelete = null;
        }
    };

    const closeDeleteModal = () => {
        modalState.deleteWallet = false;
        modalState.walletToDelete = null;
    };

    const handleModalClose = () => {
        modalState.walletModal = false;
        walletFormState.wallet = null;
    };

    const handleModalSuccess = () => {
        fetchWallets(); // Refresh the list
    };

    return (
        <div className="flex flex-col gap-5">
            <Nav />
            <div className="overflow-hidden mx-5">
                {snap.loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-gold)]"></div>
                        <span className="ml-2 text-[var(--color-gray)]">
                            იტვირთება...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Add New Wallet Card */}
                        <div
                            className="bg-[var(--color-white)] rounded-lg p-6 border-2 border-dashed border-[var(--color-black)] hover:border-[var(--color-gold)] transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
                            onClick={handleAddWallet}
                        >
                            <PlusOutlined className="text-4xl text-[var(--color-gray)] mb-3" />
                            <h3 className="text-lg font-semibold text-[var(--color-black)] text-center">
                                საფულის დამატება
                            </h3>
                        </div>

                        {/* Existing Wallet Cards */}
                        {snap.data.map((wallet) => (
                            <div
                                key={wallet._id}
                                className="bg-[var(--color-white)] rounded-lg p-6 border border-[var(--color-black)] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/finances/${wallet._id}`)}
                            >
                                <div className="flex justify-between mb-4">
                                    <h3 className="text-xl font-bold text-[var(--color-black)] truncate">
                                        {wallet.title}
                                    </h3>
                                    <div className="flex gap-2">
                                        <EditFilled
                                            className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-green)]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditWallet(wallet);
                                            }}
                                        />
                                        <DeleteFilled
                                            className={`${
                                                wallet._id === 1 || wallet._id === 2
                                                    ? "cursor-not-allowed opacity-50 text-[var(--color-gray)]"
                                                    : "cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-red)]"
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (wallet._id !== 1 && wallet._id !== 2) {
                                                    handleDeleteWallet(wallet);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-3xl font-bold text-[var(--color-gold)] mb-1">
                                        {wallet.balance.toLocaleString()} ₾
                                    </div>
                                    <div className="text-sm text-[var(--color-gray)]">
                                        ბალანსი
                                    </div>
                                </div>

                                {wallet.comment && (
                                    <div className="text-sm text-[var(--color-gray)] border-t pt-3">
                                        {wallet.comment}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Wallet Modal */}
                <WalletModal
                    isOpen={modalSnap.walletModal}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    wallet={walletFormState.wallet}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={modalSnap.deleteWallet}
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
                            {Delete.DELETE_WALLET}
                        </p>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
