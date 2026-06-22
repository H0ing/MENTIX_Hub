import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../services/authService';

// permKey matches the PERMISSIONS keys in authService
const NAV = [
  {
    group: 'Moderation',
    items: [
      {
        to: '/admin/moderation', label: 'Moderator', permKey: 'moderation',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3z"/></svg>
      },
    ],
  },
  {
    group: 'Management',
    items: [
      {
        to: '/admin/users', label: 'User Management', permKey: 'users',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14a4.6 4.6 0 0 1 5.5 4.5"/></svg>
      },
    ],
  },
  {
    group: 'System Ops',
    items: [
      {
        to: '/admin/backup', label: 'Backup', permKey: 'backup',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 16a4 4 0 1 1 .5-7.97A5 5 0 0 1 17 9a3.5 3.5 0 0 1 0 7H7z"/></svg>
      },
      {
        to: '/admin/database', label: 'Database', permKey: 'database',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5.5" rx="7" ry="2.7"/><path d="M5 5.5V18c0 1.5 3 2.7 7 2.7s7-1.2 7-2.7V5.5"/><path d="M5 12c0 1.5 3 2.7 7 2.7s7-1.2 7-2.7"/></svg>
      },
      {
        to: '/admin/audit-logs', label: 'Audit Logs', permKey: 'audit-logs',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>
      },
    ],
  },
  {
    group: 'Configuration',
    items: [
      {
        to: '/admin/sent-forms', label: 'Sent Forms', permKey: 'sent-forms',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/></svg>
      },
      {
        to: '/admin/settings', label: 'Settings', permKey: 'settings',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.4.7a7.4 7.4 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-.7-2 3.4 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a7.4 7.4 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7.4 7.4 0 0 0 1.7-1l2.4.7 2-3.4-2-1.5z"/></svg>
      },
    ],
  },
];

const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  dev_admin:   'Dev Admin',
  moderator:   'Moderator',
};

export default function Sidebar() {
  const { user } = useAuth();

  const initials = (name) => {
    if (!name) return '??';
    return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  const displayName = user?.full_name || user?.username || 'Admin';
  const displayRole = ROLE_DISPLAY[user?.role] ?? user?.role ?? '';

  return (
    <aside className="w-[248px] bg-white border-r border-[#ECE9F4] flex flex-col px-4 py-[22px] flex-shrink-0">
      {/* Brand */}
      <div className="px-2 pb-[22px]">
        <h1 className="text-[19px] m-0 text-[#7C3AED] font-black tracking-[-0.02em]">Mentix-Hub</h1>
        <span className="text-[11px] text-[#8B8B9E] uppercase tracking-[0.06em]">Admin Console</span>
      </div>

      {/* Nav — only show items the current role can access */}
      <nav className="flex-1">
        {NAV.map(({ group, items }) => {
          // Filter items this role can see
          const visible = items.filter(item => can(item.permKey));
          if (visible.length === 0) return null;

          return (
            <div key={group} className="mb-[18px]">
              <div className="text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.06em] px-2.5 py-2">
                {group}
              </div>
              {visible.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] text-[14px] font-medium mb-[2px] transition-colors no-underline
                    ${isActive
                      ? 'bg-[#F0EAFC] text-[#7C3AED] font-semibold'
                      : 'text-[#4B4B63] hover:bg-[#F7F5FF]'
                    }`
                  }
                >
                  <span className="w-[17px] h-[17px] flex-shrink-0">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-[#ECE9F4] pt-3.5">
        <div className="flex items-center gap-[7px] text-[12.5px] text-[#3D8B53] font-semibold px-2.5 py-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#16A34A] flex-shrink-0" />
          System Status: Healthy
        </div>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px]">
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
            {initials(displayName)}
          </div>
          <div>
            <div className="text-[13px] font-semibold">{displayName}</div>
            <div className="text-[11px] text-[#8B8B9E]">{displayRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
