import { ROLE_LABELS } from '../../constant/adminData';

const styles = {
  user: 'bg-blue-50 text-blue-700',
  admin: 'bg-amber-50 text-amber-700',
};

export default function RoleBadge({ role = 'user' }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[role] || styles.user}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
