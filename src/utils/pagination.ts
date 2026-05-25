export interface PaginationParams {
	page: number;
	limit: number;
	skip: number;
}

export interface PaginatedResult<T> {
	success: boolean;
	meta: {
		totalRecords: number;
		currentPage: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
	data: T[];
}

export const getPaginationParams = (query: any): PaginationParams => {
	const page = Math.max(1, parseInt(query.page as string) || 1);
	const limit = Math.max(1, parseInt(query.limit as string) || 10);
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

export const formartPaginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	totalRecords: number,
): PaginatedResult<T> => {
	const totalPages = Math.ceil(totalRecords / limit);
	return {
		success: true,
		meta: {
			totalRecords,
			currentPage: page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
		data,
	};
};
