export interface QueryParams {
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

export const getPaginationParams = (query: any): QueryParams => {
	const page = Math.max(1, parseInt(query.page as string) || 1);
	const parsedLimit = parseInt(query.limit as string) || 25;
	const limit = isNaN(parsedLimit) ? 0 : Math.max(1, parsedLimit);
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

export const formartPaginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	totalRecords: number
): PaginatedResult<T> => {
	const totalPages = limit === 0 ? 1 : Math.ceil(totalRecords / limit);
	return {
		success: true,
		meta: {
			totalRecords,
			currentPage: page,
			limit,
			totalPages,
			hasNextPage: limit !== 0 && page < totalPages,
			hasPrevPage: limit !== 0 && page > 1,
		},
		data,
	};
};
