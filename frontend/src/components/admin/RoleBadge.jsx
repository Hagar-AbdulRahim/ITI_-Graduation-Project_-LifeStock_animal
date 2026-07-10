import { ROLE_LABELS } from '../../constant/adminData';

const styles = {
  user:      'bg-sky-50 text-sky-700 border-sky-200/80 shadow-sm shadow-sky-100',
  admin:     'bg-violet-50 text-violet-700 border-violet-200/80 shadow-sm shadow-violet-100',
  sub_admin: 'bg-[#f0f8f2] text-[#1b4d2c] border-[#2a5c2a]/25 shadow-sm shadow-green-100',
};

export default function RoleBadge({ role = 'user' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all duration-200 ${styles[role] || styles.user}`}
    >
      {role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />}
      {role === 'sub_admin' && <span className="w-1.5 h-1.5 rounded-full bg-[#2a5c2a] inline-block" />}
      {role === 'user' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />}
      {ROLE_LABELS[role] || role}
    </span>
  );
}
