import { ROLE_LABELS } from '../../constant/adminData';

const styles = {
  user: 'bg-sky-50 text-sky-700 border-sky-200',
  admin: 'bg-violet-50 text-violet-700 border-violet-200',
  sub_admin: 'bg-[#2a5c2a]/8 text-[#1b4d2c] border-[#2a5c2a]/25',
};

export default function RoleBadge({ role = 'user' }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide border ${styles[role] || styles.user}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
