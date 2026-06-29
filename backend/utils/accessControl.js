const isAdmin = (user) => user?.role === "admin";
const isDoctor = (user) => user?.role === "doctor";
const isFarmer = (user) => !user?.role || user.role === "user";

const canAccessGovernorate = (user, governorate) => {
  if (isAdmin(user)) return true;
  if (isDoctor(user)) {
    const assigned = user.assigned_governorates || [];
    if (assigned.length === 0) return true;
    return assigned.includes(governorate);
  }
  return false;
};

const doctorGovernorateQuery = (user) => {
  if (!isDoctor(user)) return {};
  const assigned = user.assigned_governorates || [];
  if (assigned.length === 0) return {};
  return { governorate: { $in: assigned } };
};

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
  isDoctor,
  isFarmer,
  canAccessGovernorate,
  doctorGovernorateQuery,
  parsePagination,
  paginatedResponse,
};
