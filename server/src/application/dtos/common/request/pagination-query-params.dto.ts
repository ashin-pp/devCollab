export interface PaginationQueryParamsRequestDto {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
