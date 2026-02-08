export enum Transaction {
    ID = "N",
    TITLE = "დასახელება",
    CREATED_AT = "შექმნის თარიღი",
    TYPE = "ტიპი",
    AMOUNT = "ოდენობა",
    PRODUCT = "პროდუქტის N",
    COMMENT = "კომენტარი",
}

export enum TransactionType {
    IN = "in",
    OUT = "out",
}

export enum TransactionTypeDisplay {
    IN = "შემოსავალი",
    OUT = "გასავალი",
}

// Helper function to get display text
export const getTransactionTypeDisplay = (type: TransactionType): string => {
    return type === TransactionType.IN ? TransactionTypeDisplay.IN : TransactionTypeDisplay.OUT;
};