export type Product = {
    _id: number; //უნიკალური იდენტიფიკატორი
    title: string; //დასახელება
    category: string; //განყოფილება
    supplier: string; //მომწოდებელი
    total_quantity: number; //სრული რაოდენობა
    quantity: number; //რაოდენობა
    unit_cost: number; //ღირებულება
    total_cost: number; //ჯამური ღირებულება
    current_total_cost: number; //ამჟამინდელი ჯამური ღირებულება
    unit_price: number; //ფასი
    total_price: number; //ჯამური ფასი
    unit_profit: number; //მოგება
    total_profit: number; //ჯამური მოგება
    profit_percentage: number; //მოგების პროცენტი
    comment: string; //კომენტარი
    deleted?: boolean; //წაშლილი
    createdAt: string; //შექმნის თარიღი
};

export type Category = {
    _id: number;
    title: string;
};

export type Supplier = {
    _id: number;
    title: string;
};

export type PaginationData = {
    data: Product[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
};
