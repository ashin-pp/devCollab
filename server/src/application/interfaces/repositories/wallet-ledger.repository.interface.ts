import { WalletLedgerEntry } from "../../../domain/entities/wallet-ledger-entry.entity";

export interface WalletLedgerQuery {
    page: number;
    limit: number;
}

export type WalletLedgerRow = WalletLedgerEntry & {
    userName?: string;
    userEmail?: string;
};

export interface WalletLedgerPage {
    items: WalletLedgerRow[];
    total: number;
}

export interface WalletBalance {
    balance: number;
    currency: string;
    creditCount: number;
    debitCount: number;
}

export interface IWalletLedgerRepository {
    creditIfAbsent(entry: Partial<WalletLedgerEntry>): Promise<WalletLedgerEntry>;
    getBalance(): Promise<WalletBalance>;
    findPaginated(query: WalletLedgerQuery): Promise<WalletLedgerPage>;
}
