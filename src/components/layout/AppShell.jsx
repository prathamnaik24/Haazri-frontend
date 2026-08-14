import { useNavigate, useLocation } from 'react-router-dom'
import {
  BurraaLogo, DashboardIcon, AttendanceIcon, LeaveIcon, TeamIcon,
  ApprovalIcon, EmployeesIcon, OrgIcon, ReportsIcon, AuditIcon,
  RolesIcon, ProfileIcon, LogoutIcon, SearchIcon, BellIcon, UserAvatarSvg,
} from '../ui/Icons.jsx'
import { getUserFromToken, getUserRole, logout } from '../../utils/auth.js'

// ─── Role-based nav config ─────────────────────────────────────────────────
const NAV_CONFIG = {
  employee: [
    { path: '/app/dashboard',    label: 'Dashboard',     Icon: DashboardIcon },
    { path: '/app/attendance',   label: 'My Attendance', Icon: AttendanceIcon },
    { path: '/app/leave',        label: 'My Leave',      Icon: LeaveIcon },
    { path: '/app/profile',      label: 'Profile',       Icon: ProfileIcon },
  ],
  manager: [
    { path: '/app/dashboard',      label: 'Dashboard',       Icon: DashboardIcon },
    { path: '/app/attendance',     label: 'My Attendance',   Icon: AttendanceIcon },
    { path: '/app/leave',          label: 'My Leave',        Icon: LeaveIcon },
    { path: '/app/team-attendance',label: 'Team Attendance', Icon: TeamIcon },
    { path: '/app/leave-approvals',label: 'Leave Approvals', Icon: ApprovalIcon },
    { path: '/app/profile',        label: 'Profile',         Icon: ProfileIcon },
  ],
  org_admin: [
    { path: '/app/dashboard',    label: 'Dashboard',          Icon: DashboardIcon },
    { path: '/app/employees',    label: 'Employees',          Icon: EmployeesIcon },
    { path: '/app/org-structure',label: 'Org Structure',      Icon: OrgIcon },
    { path: '/app/attendance',   label: 'Attendance',         Icon: AttendanceIcon },
    { path: '/app/leave',        label: 'Leave Management',   Icon: LeaveIcon },
    { path: '/app/roles',        label: 'Roles & Permissions',Icon: RolesIcon },
    { path: '/app/reports',      label: 'Reports',            Icon: ReportsIcon },
    { path: '/app/audit-logs',   label: 'Audit Logs',         Icon: AuditIcon },
    { path: '/app/profile',      label: 'Profile',            Icon: ProfileIcon },
  ],
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ role }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = NAV_CONFIG[role] || NAV_CONFIG.employee

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: 14, textAlign: 'left', width: '100%', transition: 'all 0.15s',
  }

  return (
    <aside style={{
      width: 220, minWidth: 220, background: '#fff',
      display: 'flex', flexDirection: 'column',
      padding: '24px 12px', borderRight: '1px solid #e5e7eb', gap: 4,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 20px' }}>
        <BurraaLogo />
        <span style={{ fontWeight: 700, fontSize: 18, color: '#111827', letterSpacing: '-0.02em' }}>Burraa</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...btnBase,
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#2563eb' : '#6b7280',
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <item.Icon size={18} color={isActive ? '#2563eb' : '#9ca3af'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
        <button
          onClick={logout}
          style={{ ...btnBase, background: 'transparent', color: '#6b7280', fontWeight: 400 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
        >
          <LogoutIcon size={16} color="#9ca3af" />
          Logout
        </button>
      </div>
    </aside>
  )
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ user }) {
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'User'
  const email = user?.email || ''

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb',
        border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 320,
      }}>
        <SearchIcon size={16} color="#9ca3af" />
        <input
          placeholder="Search..."
          style={{ border: 'none', outline: 'none', fontSize: 14, color: '#374151', background: 'transparent', width: '100%' }}
        />
      </div>
      <div style={{ flex: 1 }} />
      <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
        <BellIcon size={22} color="#6b7280" />
        <span style={{
          position: 'absolute', top: 6, right: 6, width: 8, height: 8,
          background: '#3b82f6', borderRadius: '50%', border: '2px solid #fff',
        }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #93c5fd, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <UserAvatarSvg />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>{displayName}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.2 }}>{email}</div>
        </div>
      </div>
    </header>
  )
}

// ─── AppShell ──────────────────────────────────────────────────────────────
export default function AppShell({ children }) {
  const role = getUserRole() || 'employee'
  const user = getUserFromToken()
  const navigate = useNavigate()

  // Redirect to login if no token
  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header user={user} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
