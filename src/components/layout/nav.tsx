import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { Button } from "../Button";
import { walletsState } from "../../states";
import { getWallets } from "../../actions/wallets";

export default function Nav() {
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch wallets on component mount to ensure balance is available
    useEffect(() => {
        const fetchWallets = async () => {
            if (walletsState.data.length === 0) {
                try {
                    const walletsData = await getWallets();
                    walletsState.data = walletsData || [];
                } catch (error) {
                    console.error("Error fetching wallets:", error);
                }
            }
        };

        fetchWallets();
    }, []);

    // Get the სასანთლე wallet balance (ID 1)
    const getSasantleBalance = () => {
        const sasantleWallet = walletsState.data.find(
            (wallet) => wallet._id === 1,
        );
        return sasantleWallet ? sasantleWallet.balance : 0;
    };

    function handleNavigation(path: string) {
        navigate(path);
    }

    const handleLogoutClick = async () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="bg-[var(--color-bg-dark)] text-[var(--color-white)] px-4 flex justify-between items-center w-full h-[90px]">
            <div className="flex items-center">
                <img
                    src="/logo.png"
                    alt="logo"
                    width={80}
                    onClick={() => handleNavigation("/")}
                    className="cursor-pointer"
                />
            </div>
            <div className="flex items-center gap-2 sm:gap-5">
                <Button
                    title="პროდუქტები"
                    onClick={() => handleNavigation("/")}
                    type="transparent"
                    customClasses={`${
                        location.pathname === "/"
                            ? "text-[var(--color-gray)]"
                            : ""
                    }`}
                />
                <Button
                    title="ფინანსები"
                    onClick={() => handleNavigation("/finances")}
                    type="transparent"
                    customClasses={`${
                        location.pathname === "/finances"
                            ? "text-[var(--color-gray)]"
                            : ""
                    }`}
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-[var(--color-white)]">
                        ბალანსი:
                    </span>
                    <span className="text-lg font-bold text-[var(--color-gold)]">
                        {getSasantleBalance().toLocaleString()} ₾
                    </span>
                </div>

                <Button
                    title="გასვლა"
                    type="gold"
                    onClick={handleLogoutClick}
                />
            </div>
        </nav>
    );
}
