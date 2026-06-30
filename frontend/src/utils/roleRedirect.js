export const getRoleHomePath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'doctor') return '/doctor/dashboard';
  return '/farms';
};

export const selectUserRole = (state) => state.auth?.user?.role || 'user';
