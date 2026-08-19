export interface PaginationQueryParamsRequestDto {
    page?: number;
    limit?: number;
    search?: string;
    filter?: string;
    /** Plan ObjectId, or `"none"` for users/owners with no selected plan. */
    planId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
