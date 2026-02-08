import { getCategories } from "../../../actions/categories";
import { getSuppliers } from "../../../actions/suppliers";
import { useEffect } from "react";
import queryString from "query-string";
import { useNavigate } from "react-router";
import { useSnapshot } from "valtio";
import {
    filterModalState,
    categoriesState,
    suppliersState,
} from "../../../states";
import { TransactionType, TransactionTypeDisplay } from "../../../enums/transactions";

export const FilterSelectorModal = ({ column }: { column: string }) => {
    const navigate = useNavigate();
    const snap = useSnapshot(filterModalState);

    const handleFilter = (id: string) => {
        const query = queryString.parse(window.location.search);
        const currentFilters = (query[column] as string)?.split(",") || [];

        let updatedFilters;
        if (currentFilters.includes(id)) {
            updatedFilters = currentFilters.filter((filter) => filter !== id);
        } else {
            updatedFilters = [...currentFilters, id];
        }

        if (updatedFilters.length > 0) {
            query[column] = updatedFilters.join(",");
        } else {
            delete query[column];
        }

        const updatedQuery = queryString.stringify(query, {
            arrayFormat: "comma",
        });

        navigate(`${window.location.pathname}?${updatedQuery}`, {
            replace: true,
        });

        filterModalState.selectedFilters = updatedFilters;
    };

    const handleDateFilter = () => {
        if (!snap.fromDate || !snap.toDate) return;

        // Convert ISO dates to DD MM YYYY format for backend
        const fromDateObj = new Date(snap.fromDate);
        const toDateObj = new Date(snap.toDate);

        const fromDay = fromDateObj.getDate().toString().padStart(2, "0");
        const fromMonth = (fromDateObj.getMonth() + 1)
            .toString()
            .padStart(2, "0");
        const fromYear = fromDateObj.getFullYear();
        const formattedFromDate = `${fromDay} ${fromMonth} ${fromYear}`;

        const toDay = toDateObj.getDate().toString().padStart(2, "0");
        const toMonth = (toDateObj.getMonth() + 1).toString().padStart(2, "0");
        const toYear = toDateObj.getFullYear();
        const formattedToDate = `${toDay} ${toMonth} ${toYear}`;

        const query = queryString.parse(window.location.search);

        // Set the date range filter - handle both createdAt and created_at
        const dateKey = column === "created_at" ? "created_at" : "createdAt";
        (query as any)[dateKey] = {
            from: formattedFromDate,
            to: formattedToDate,
        };

        const updatedQuery = queryString.stringify(query, {
            arrayFormat: "comma",
        });

        navigate(`${window.location.pathname}?${updatedQuery}`, {
            replace: true,
        });

        // Store the date range in selectedFilters for display
        filterModalState.selectedFilters = [
            `${formattedFromDate} - ${formattedToDate}`,
        ];

        // Reset the date inputs
        filterModalState.fromDate = "";
        filterModalState.toDate = "";
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                if (column === "supplier") {
                    const suppliersData = await getSuppliers();
                    filterModalState.filters = suppliersData || [];
                } else if (column === "category") {
                    const categoriesData = await getCategories();
                    filterModalState.filters = categoriesData || [];
                } else if (column === "type") {
                    // Hardcode transaction types from enum
                    filterModalState.filters = [
                        { _id: 1, title: TransactionTypeDisplay.IN, value: TransactionType.IN },
                        { _id: 2, title: TransactionTypeDisplay.OUT, value: TransactionType.OUT },
                    ];
                }
            } catch (error) {
                console.error("Error fetching filters:", error);
                filterModalState.filters = [];
            }
        };
        fetchFilters();

        const query = queryString.parse(window.location.search);

        if (column === "createdAt" || column === "created_at") {
            // Handle date range filter initialization
            const dateKey = column === "created_at" ? "created_at" : "createdAt";
            if (
                query[dateKey] &&
                typeof query[dateKey] === "object" &&
                "from" in query[dateKey] &&
                "to" in query[dateKey]
            ) {
                const dateRange = query[dateKey] as any;
                filterModalState.selectedFilters = [
                    `${dateRange.from} - ${dateRange.to}`,
                ];
            } else {
                filterModalState.selectedFilters = [];
            }
        } else {
            // Handle regular filters
            const initialFilters = (query[column] as string)?.split(",") || [];
            filterModalState.selectedFilters = initialFilters;
        }
    }, [column]);

    // Render date picker for createdAt or created_at column
    if (column === "createdAt" || column === "created_at") {
        return (
            <div className="fixed mt-2 p-4 rounded shadow-lg text-[var(--color-black)] bg-[var(--color-white)] border z-10 min-w-[280px]">
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">
                        აირჩიეთ თარიღის დიაპაზონი:
                    </label>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-xs text-[var(--color-gray)] mb-1">
                                დან:
                            </label>
                            <input
                                type="date"
                                value={snap.fromDate}
                                onChange={(e) =>
                                    (filterModalState.fromDate = e.target.value)
                                }
                                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--color-gray)] mb-1">
                                მდე:
                            </label>
                            <input
                                type="date"
                                value={snap.toDate}
                                onChange={(e) =>
                                    (filterModalState.toDate = e.target.value)
                                }
                                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDateFilter}
                    disabled={!snap.fromDate || !snap.toDate}
                    className="w-full px-4 py-2 bg-[var(--color-gold)] text-[var(--color-white)] rounded-md hover:bg-[var(--color-dark-gold)] disabled:bg-[var(--color-gray)] disabled:cursor-not-allowed"
                >
                    გაფილტრვა
                </button>

                {/* Show selected date range filter */}
                {snap.selectedFilters.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-bg-light)]">
                        <div className="text-sm font-medium mb-2">
                            არჩეული თარიღის დიაპაზონი:
                        </div>
                        {snap.selectedFilters.map((dateRange, index) => {
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-1"
                                >
                                    <span className="text-sm">{dateRange}</span>
                                    <button
                                        onClick={() => {
                                            // Remove the date range filter
                                            const query = queryString.parse(
                                                window.location.search
                                            );
                                            const dateKey = column === "created_at" ? "created_at" : "createdAt";
                                            delete query[dateKey];
                                            const updatedQuery =
                                                queryString.stringify(query, {
                                                    arrayFormat: "comma",
                                                });
                                            navigate(
                                                `${window.location.pathname}?${updatedQuery}`,
                                                {
                                                    replace: true,
                                                }
                                            );
                                            filterModalState.selectedFilters =
                                                [];
                                        }}
                                        className="text-[var(--color-red)] hover:text-[var(--color-red)] text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Render regular filters for other columns
    return (
        <div className="fixed mt-2 p-3 rounded shadow-lg text-[var(--color-black)] bg-[var(--color-white)] border z-10">
            {Array.isArray(snap.filters) &&
                snap.filters.map((filter) => {
                    // For type filter, use the value ("in" or "out") instead of title
                    const filterValue = column === "type" && filter.value ? filter.value : filter.title.toString();
                    const displayValue = column === "type" ? filter.title : filter.title;
                    
                    return (
                        <label key={filter._id} className="block mb-2 text-left">
                            <input
                                type="checkbox"
                                name={column}
                                checked={snap.selectedFilters.includes(filterValue)}
                                onChange={() => handleFilter(filterValue)}
                                className="mr-2"
                            />
                            {displayValue}
                        </label>
                    );
                })}
        </div>
    );
};
