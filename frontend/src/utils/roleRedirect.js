export const getRoleHomePath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  return '/';
};

export const selectUserRole = (state) => state.auth?.user?.role || 'user';
