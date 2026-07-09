const isAdmin = (user) => user?.role === "admin";
const isFarmer = (user) => !user?.role || user.role === "user";

const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const paginatedResponse = (res, data, total, page, limit) =>
  res.json({
    success: true,
    count: data.length,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });

module.exports = {
  isAdmin,
  isFarmer,
  parsePagination,
  paginatedResponse,
};
