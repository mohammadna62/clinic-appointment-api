export const createPaginationData = (page, limit, totalCount) => ({
  page,
  limit,
  total: totalCount,
  totalPages: Math.ceil(totalCount / limit),
});