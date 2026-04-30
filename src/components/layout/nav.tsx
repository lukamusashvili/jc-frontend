import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { walletsState } from "../../states";
import { getWallets } from "../../actions/wallets";
import { getTodayTransactionsSum } from "../../actions/transactions";
import { GEORGIAN_MONTHS } from "../../enums/months";

export default function Nav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [dailyBalance, setDailyBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletsData, sum] = await Promise.all([
                    walletsState.data.length === 0 ? getWallets() : Promise.resolve(walletsState.data),
                    getTodayTransactionsSum("1"),
                ]);
                if (walletsData) walletsState.data = walletsData;
                setDailyBalance(sum);
            } catch (error) {
                console.error("Error fetching nav data:", error);
                setDailyBalance(0);
            }
        };

        fetchData();
    }, []);

    const today = new Date();
    const tooltipText = `${today.getDate()} ${GEORGIAN_MONTHS[today.getMonth()]} ბალანსი`;

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
                <div
                    className="relative group flex items-center gap-2 px-3 py-2 whitespace-nowrap cursor-default"
                >
                    <span className="text-sm text-[var(--color-white)]">
                        ბალანსი:
                    </span>
                    {dailyBalance === null ? (
                        <span className="text-lg font-bold text-[var(--color-gold)] animate-pulse">
                            ...
                        </span>
                    ) : (
                        <span className="text-lg font-bold text-[var(--color-gold)]">
                            {dailyBalance.toLocaleString()} ₾
                        </span>
                    )}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[var(--color-bg-dark)] border border-[var(--color-gray)] text-xs text-[var(--color-white)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                        {tooltipText}
                    </div>
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
