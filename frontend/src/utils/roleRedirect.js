export const isFullAdmin = (role) => role === 'admin';
export const isSubAdmin = (role) => role === 'sub_admin';
export const isStaff = (role) => role === 'admin' || role === 'sub_admin';
export const canModifyLivestock = (role) => false; // Admin cannot delete farms/animals anymore

export const getRoleHomePath = (role) => {
  if (isStaff(role)) return '/admin/dashboard';
  return '/';
};

export const selectUserRole = (state) => state.auth?.user?.role || 'user';
