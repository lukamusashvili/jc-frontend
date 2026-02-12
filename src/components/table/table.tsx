import { useNavigate, useLocation } from "react-router";
import { useCallback } from "react";
import {
    EditFilled,
    FilterFilled,
    ReloadOutlined,
    ShoppingCartOutlined,
    GiftOutlined,
    DeleteOutlined,
    RollbackOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
} from "@ant-design/icons";
import { TableProps } from "../../types/table";
import {
    TransactionType,
    TransactionTypeDisplay,
} from "../../enums/transactions";
import { FilterSelectorModal } from "./modals/filterSelectorModal";
import { useSnapshot } from "valtio";
import { tableState } from "../../states";
import { Table as TableEnum } from "../../enums/table";

export const Table = <T extends Record<string, any>>({
    data,
    loading,
    columns,
    onEdit,
    onQuickSell,
    onGift,
    onDelete,
    onRestore,
    onPermanentDelete,
}: TableProps<T>) => {
    const navigate = useNavigate();
    const location = useLocation();
    const snap = useSnapshot(tableState);

    const { displayColumns, filterableColumns, sortableColumns = [], displayNames } = columns;

    const handleEdit = useCallback(
        (item: T) => {
            if (onEdit) {
                onEdit(item);
            }
        },
        [onEdit],
    );

    const handleQuickSell = useCallback(
        (item: T) => {
            if (onQuickSell) {
                onQuickSell(item);
            }
        },
        [onQuickSell],
    );

    const handleGift = useCallback(
        (item: T) => {
            if (onGift) {
                onGift(item);
            }
        },
        [onGift],
    );

    const handleDelete = useCallback(
        (item: T) => {
            if (onDelete) {
                onDelete(item);
            }
        },
        [onDelete],
    );

    const handleRestore = useCallback(
        (item: T) => {
            if (onRestore) {
                onRestore(item);
            }
        },
        [onRestore],
    );

    const handlePermanentDelete = useCallback(
        (item: T) => {
            if (onPermanentDelete) {
                onPermanentDelete(item);
            }
        },
        [onPermanentDelete],
    );

    const handleFilter = useCallback(
        (column: keyof T) => {
            tableState.activeFilterColumn =
                snap.activeFilterColumn === column ? null : column;
        },
        [snap.activeFilterColumn],
    );

    const resetParams = useCallback(() => {
        tableState.activeFilterColumn = null;
        navigate(`${window.location.pathname}?${new URLSearchParams({})}`);
    }, [navigate]);

    const goToNextPage = useCallback(() => {
        if (data.pagination?.hasNextPage) {
            const newPage = data.pagination.currentPage + 1;

            const searchParams = new URLSearchParams(location.search);
            searchParams.set("page", newPage.toString());

            navigate(`${location.pathname}?${searchParams.toString()}`, {
                replace: true,
            });
        }
    }, [data.pagination, location.search, location.pathname, navigate]);

    const goToPrevPage = useCallback(() => {
        if (data.pagination?.hasPrevPage) {
            const newPage = data.pagination.currentPage - 1;

            const searchParams = new URLSearchParams(location.search);
            searchParams.set("page", newPage.toString());

            navigate(`${location.pathname}?${searchParams.toString()}`, {
                replace: true,
            });
        }
    }, [data.pagination, location.search, location.pathname, navigate]);

    const goToPage = useCallback(
        (page: number) => {
            if (
                data.pagination &&
                page >= 1 &&
                page <= data.pagination.totalPages
            ) {
                const searchParams = new URLSearchParams(location.search);
                searchParams.set("page", page.toString());

                navigate(`${location.pathname}?${searchParams.toString()}`, {
                    replace: true,
                });
            }
        },
        [data.pagination, location.search, location.pathname, navigate],
    );

    const handleLimitChange = useCallback(
        (newLimit: number) => {
            const searchParams = new URLSearchParams(location.search);
            searchParams.set("limit", newLimit.toString());
            searchParams.set("page", "1");

            navigate(`${location.pathname}?${searchParams.toString()}`, {
                replace: true,
            });
        },
        [location.search, location.pathname, navigate],
    );

    const handleSearchChange = useCallback(
        (searchTerm: string) => {
            const searchParams = new URLSearchParams(location.search);
            if (searchTerm.trim()) {
                searchParams.set("search", searchTerm.trim());
            } else {
                searchParams.delete("search");
            }
            searchParams.set("page", "1"); // Reset to first page on search

            navigate(`${location.pathname}?${searchParams.toString()}`, {
                replace: true,
            });
        },
        [location.search, location.pathname, navigate],
    );

    const handleSortToggle = useCallback(
        (column: keyof T) => {
            const searchParams = new URLSearchParams(location.search);
            const currentSort = searchParams.get("sort");
            const currentOrder = searchParams.get("order");
            
            // If clicking on the same column, toggle order; otherwise set to ascending
            if (currentSort === String(column)) {
                const newOrder = currentOrder === "desc" ? "asc" : "desc";
                searchParams.set("order", newOrder);
            } else {
                searchParams.set("sort", String(column));
                searchParams.set("order", "asc");
            }
            
            searchParams.set("page", "1"); // Reset to first page on sort

            navigate(`${location.pathname}?${searchParams.toString()}`, {
                replace: true,
            });
        },
        [location.search, location.pathname, navigate],
    );

    const renderPaginationButtons = useCallback(() => {
        if (!data.pagination) return [];

        const {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
        } = data.pagination;
        const buttons = [];

        buttons.push(
            <button
                key="prev"
                onClick={goToPrevPage}
                disabled={!hasPrevPage}
                className={`px-3 py-1 rounded border ${
                    hasPrevPage
                        ? "bg-[var(--color-gold)] text-[var(--color-white)] hover:bg-[var(--color-dark-gold)] border-[var(--color-dark-gold)]"
                        : "bg-[var(--color-gray)] text-[var(--color-white)] cursor-not-allowed border-[var(--color-gray)]"
                }`}
            >
                წინა
            </button>,
        );

        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);

        if (startPage > 1) {
            buttons.push(
                <button
                    key="first"
                    onClick={() => goToPage(1)}
                    className="px-3 py-1 rounded border bg-[var(--color-bg-light)] text-[var(--color-black)] hover:bg-[var(--color-gray)] border-[var(--color-gray)]"
                >
                    1
                </button>,
            );
            if (startPage > 2) {
                buttons.push(
                    <span key="dots1" className="px-2 py-1">
                        ...
                    </span>,
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded border ${
                        i === page
                            ? "bg-[var(--color-gold)] text-[var(--color-white)] border-[var(--color-dark-gold)]"
                            : "bg-[var(--color-bg-light)] text-[var(--color-black)] hover:bg-[var(--color-gray)] border-[var(--color-gray)]"
                    }`}
                >
                    {i}
                </button>,
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="dots2" className="px-2 py-1">
                        ...
                    </span>,
                );
            }
            buttons.push(
                <button
                    key="last"
                    onClick={() => goToPage(totalPages)}
                    className="px-3 py-1 rounded border bg-[var(--color-bg-light)] text-[var(--color-black)] hover:bg-[var(--color-gray)] border-[var(--color-gray)]"
                >
                    {totalPages}
                </button>,
            );
        }

        buttons.push(
            <button
                key="next"
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className={`px-3 py-1 rounded border ${
                    hasNextPage
                        ? "bg-[var(--color-gold)] text-[var(--color-white)] hover:bg-[var(--color-dark-gold)] border-[var(--color-dark-gold)]"
                        : "bg-[var(--color-gray)] text-[var(--color-white)] cursor-not-allowed border-[var(--color-gray)]"
                }`}
            >
                შემდეგი
            </button>,
        );

        return buttons;
    }, [data.pagination, goToNextPage, goToPrevPage, goToPage]);

    const formatCellValue = (value: unknown, key: keyof T): string => {
        if (value === null || value === undefined) return "";

        if (typeof value === "number") {
            if (
                key === "unit_price" ||
                key === "unit_cost" ||
                key === "amount"
            ) {
                return value.toLocaleString() + " ₾";
            }
            return value.toLocaleString();
        }

        // Format createdAt or created_at field as DD/MM/YYYY HH:MM:SS
        if (
            (key === "createdAt" || key === "created_at") &&
            typeof value === "string"
        ) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const day = date.getDate().toString().padStart(2, "0");
                    const month = (date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                    const year = date.getFullYear();
                    const hours = date.getHours().toString().padStart(2, "0");
                    const minutes = date
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                    const seconds = date
                        .getSeconds()
                        .toString()
                        .padStart(2, "0");
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                }
            } catch (error) {
                // If date parsing fails, return original value
            }
        }

        // Format type field to display Georgian text
        if (key === "type" && typeof value === "string") {
            if (value === TransactionType.IN) {
                return TransactionTypeDisplay.IN;
            } else if (value === TransactionType.OUT) {
                return TransactionTypeDisplay.OUT;
            }
        }

        return String(value);
    };

    const getColumnDisplayName = (key: keyof T): string => {
        return displayNames[key] || String(key);
    };

    return (
        <div className="w-full">
            {/* Pagination Info and Controls */}
            {data.pagination && data.pagination.totalCount !== undefined && (
                <div className="flex justify-between items-center mt-4 mb-2">
                    <div className="text-sm font-semibold text-[var(--color-black)] flex gap-4">
                        <span>
                            ჯამური: {data.pagination.totalCount} ჩანაწერი
                        </span>
                        {data.totalAmount !== undefined && (
                            <span>
                                ჯამური ოდენობა:{" "}
                                {data.totalAmount.toLocaleString()} ლარი
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-black)]">
                                ძებნა:
                            </span>
                            <input
                                type="text"
                                value={
                                    new URLSearchParams(location.search).get(
                                        "search",
                                    ) || ""
                                }
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                placeholder="პროდუქტის დასახელება..."
                                className="bg-white border border-[var(--color-gray)] rounded px-3 py-1 text-sm w-48"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-black)]">
                                გვერდზე:
                            </span>
                            <select
                                value={data.pagination.limit}
                                onChange={(e) =>
                                    handleLimitChange(Number(e.target.value))
                                }
                                className="bg-white border border-[var(--color-gray)] rounded px-2 py-1 text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-gold)]"></div>
                    <span className="ml-2 text-[var(--color-gray)]">
                        იტვირთება...
                    </span>
                </div>
            ) : (
                <>
                    <div className="w-full mt-10 rounded-lg overflow-x-auto shadow-lg">
                        <table className="w-full rounded-lg table-fixed">
                            <thead className="text-sm h-16 text-[var(--color-black)] bg-[var(--color-gold)] shadow-md">
                                <tr>
                                    {displayColumns.map((key) => (
                                        <th
                                            key={String(key)}
                                            className="text-left px-2 border-r border-[var(--color-gray)]"
                                        >
                                            <span className="flex justify-between items-center">
                                                <span>
                                                    {getColumnDisplayName(key)}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {sortableColumns.includes(
                                                        key,
                                                    ) && (
                                                        <div
                                                            onClick={() =>
                                                                handleSortToggle(
                                                                    key,
                                                                )
                                                            }
                                                            className="cursor-pointer hover:opacity-70 transition-opacity"
                                                        >
                                                            {new URLSearchParams(
                                                                location.search,
                                                            ).get("sort") ===
                                                            String(key) &&
                                                            new URLSearchParams(
                                                                location.search,
                                                            ).get("order") ===
                                                                "desc" ? (
                                                                <SortDescendingOutlined />
                                                            ) : (
                                                                <SortAscendingOutlined />
                                                            )}
                                                        </div>
                                                    )}
                                                    {filterableColumns.includes(
                                                        key,
                                                    ) && (
                                                        <div className="relative">
                                                            <FilterFilled
                                                                onClick={() =>
                                                                    handleFilter(
                                                                        key,
                                                                    )
                                                                }
                                                                className="cursor-pointer hover:opacity-70 transition-opacity"
                                                            />
                                                            {snap.activeFilterColumn ===
                                                                key && (
                                                                <FilterSelectorModal
                                                                    column={String(
                                                                        snap.activeFilterColumn,
                                                                    )}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </span>
                                        </th>
                                    ))}
                                    <th className="text-left px-2 border-r border-[var(--color-gray)]">
                                        {TableEnum.ACTIONS}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm bg-[var(--color-white)]">
                                {!data.data || data.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={displayColumns.length + 1}
                                            className="text-center py-5"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {TableEnum.NO_DATA_FOUND}
                                                <ReloadOutlined
                                                    className="cursor-pointer hover:opacity-70 transition-opacity"
                                                    onClick={resetParams}
                                                />
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    (Array.isArray(data.data)
                                        ? data.data
                                        : []
                                    ).map((item: T, rowIndex: number) => (
                                        <tr
                                            key={item._id || rowIndex}
                                            className="h-16 border-b border-[var(--color-bg-light)] hover:bg-[var(--color-bg-light)] transition-colors"
                                        >
                                            {displayColumns.map((key) => {
                                                return (
                                                    <td
                                                        key={`${
                                                            item._id
                                                        }-${String(key)}`}
                                                        className="px-2 border-r border-[var(--color-bg-light)] truncate"
                                                        title={formatCellValue(
                                                            item[key],
                                                            key,
                                                        )}
                                                    >
                                                        {formatCellValue(
                                                            item[key],
                                                            key,
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-2 border-r border-[var(--color-bg-light)]">
                                                <div className="flex items-center gap-2">
                                                    {onRestore && onPermanentDelete ? (
                                                        <>
                                                            <RollbackOutlined
                                                                className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-green)]"
                                                                onClick={() =>
                                                                    handleRestore(
                                                                        item,
                                                                    )
                                                                }
                                                            />
                                                            <DeleteOutlined
                                                                className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-red)]"
                                                                onClick={() =>
                                                                    handlePermanentDelete(
                                                                        item,
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            {onEdit && (
                                                                <EditFilled
                                                                    className="cursor-pointer hover:opacity-70 transition-opacity"
                                                                    onClick={() =>
                                                                        handleEdit(item)
                                                                    }
                                                                />
                                                            )}
                                                            {onQuickSell && (
                                                                <ShoppingCartOutlined
                                                                    className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-green)]"
                                                                    onClick={() =>
                                                                        handleQuickSell(
                                                                            item,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                            {onGift && (
                                                                <GiftOutlined
                                                                    className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-green)]"
                                                                    onClick={() =>
                                                                        handleGift(
                                                                            item,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                            {onDelete && (
                                                                <DeleteOutlined
                                                                    className="cursor-pointer hover:opacity-70 transition-opacity text-[var(--color-red)]"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item,
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Buttons */}
                    {data.pagination && data.pagination.totalPages > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-4 mb-4">
                            {renderPaginationButtons()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
