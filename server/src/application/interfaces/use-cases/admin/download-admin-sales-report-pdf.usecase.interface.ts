export interface DownloadAdminSalesReportPdfParams {
    status?: string;
    planName?: string;
    from?: string;
    to?: string;
}

export interface DownloadAdminSalesReportPdfResult {
    buffer: Buffer;
    filename: string;
}

export interface IDownloadAdminSalesReportPdfUseCase {
    execute(params: DownloadAdminSalesReportPdfParams): Promise<DownloadAdminSalesReportPdfResult>;
}
