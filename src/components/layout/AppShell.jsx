import { useNavigate, useLocation } from 'react-router-dom'
import {
  BurraaLogo, DashboardIcon, AttendanceIcon, LeaveIcon, TeamIcon,
  ApprovalIcon, EmployeesIcon, OrgIcon, ReportsIcon, AuditIcon,
  RolesIcon, ProfileIcon, LogoutIcon, SearchIcon, BellIcon, UserAvatarSvg,
  FinanceIcon, HRIcon,
} from '../ui/Icons.jsx'
import { getUserFromToken, getUserRole, logout } from '../../utils/auth.js'

// ─── Role-based nav config ─────────────────────────────────────────────────
const NAV_CONFIG = {
  employee: [
    { path: '/app/dashboard',    label: 'Dashboard',     Icon: DashboardIcon },
    { path: '/app/attendance',   label: 'My Attendance', Icon: AttendanceIcon },
    { path: '/app/leave',        label: 'My Leave',      Icon: LeaveIcon },
    { path: '/app/finance',      label: 'My Payslips',   Icon: FinanceIcon },
    { path: '/app/profile',      label: 'Profile',       Icon: ProfileIcon },
    { path: '/app/resignation',  label: 'My Resignation', Icon: ApprovalIcon },
  ],
  manager: [
    { path: '/app/dashboard',      label: 'Dashboard',       Icon: DashboardIcon },
    { path: '/app/attendance',     label: 'My Attendance',   Icon: AttendanceIcon },
    { path: '/app/leave',          label: 'My Leave',        Icon: LeaveIcon },
    { path: '/app/team-attendance',label: 'Team Attendance', Icon: TeamIcon },
    { path: '/app/leave-approvals',label: 'Leave Approvals', Icon: ApprovalIcon },
    { path: '/app/hr-leaves',      label: 'HR Leaves',       Icon: HRIcon },
    { path: '/app/resignation',    label: 'My Resignation',  Icon: ApprovalIcon },
    { path: '/app/finance',        label: 'My Payslips',     Icon: FinanceIcon },
    { path: '/app/profile',        label: 'Profile',         Icon: ProfileIcon },
    { path: '/app/manager-resignations', label: 'Resignations', Icon: ApprovalIcon },
    { path: '/app/hr-resignations', label: 'HR Resignations', Icon: HRIcon, roles: ['HR Manager', 'Org Admin'] },
  ],
  org_admin: [
    { path: '/app/dashboard',    label: 'Dashboard',          Icon: DashboardIcon },
    { path: '/app/employees',    label: 'Employees',          Icon: EmployeesIcon },
    { path: '/app/org-structure',label: 'Org Structure',      Icon: OrgIcon },
    { path: '/app/attendance',   label: 'Attendance',         Icon: AttendanceIcon },
    { path: '/app/leave',        label: 'My Leave',           Icon: LeaveIcon },
    { path: '/app/leave-approvals',label: 'Leave Approvals',  Icon: ApprovalIcon },
    { path: '/app/hr-leaves',    label: 'HR Leaves',          Icon: HRIcon },
    { path: '/app/finance',      label: 'Finance & Payroll',  Icon: FinanceIcon, feature: 'financial_dashboard' },
    { path: '/app/billing',      label: 'Billing & Plan',     Icon: FinanceIcon, feature: 'billing_portal' },
    { path: '/app/roles',        label: 'Roles & Permissions',Icon: RolesIcon },
    { path: '/app/reports',      label: 'Reports & Schedule', Icon: ReportsIcon },
    { path: '/app/audit-logs',   label: 'Audit Logs',         Icon: AuditIcon },
    { path: '/app/profile',      label: 'Profile',            Icon: ProfileIcon },
    { path: '/app/hr-resignations', label: 'Resignations',      Icon: HRIcon },
  ],
}

NAV_CONFIG.employee.splice(3, 0, { path: '/app/org-structure', label: 'Org Structure', Icon: OrgIcon })
NAV_CONFIG.manager.splice(3, 0, { path: '/app/org-structure', label: 'Org Structure', Icon: OrgIcon })

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ role }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUserFromToken()
  const userFeatures = user?.features || [
    'basic_attendance',
    'basic_leaves',
    'financial_dashboard',
    'billing_portal',
    'subscription_management',
  ]

  let rawItems = NAV_CONFIG[role] || NAV_CONFIG.employee
  if (role === 'employee' && (user?.is_manager || user?.has_subordinates || (user?.position_path && user.position_path.split('.').length >= 2))) {
    rawItems = NAV_CONFIG.manager
  }

  const navItems = rawItems.filter(item => {
    if (item.roles && !item.roles.some(required => required === user?.type || (user?.roles || []).includes(required))) return false
    if (!item.feature || role === 'org_admin') return true
    return userFeatures.includes(item.feature)
  })

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: 13.5, textAlign: 'left', width: '100%', transition: 'all 0.15s',
  }

  return (
    <aside style={{
      width: 220, minWidth: 220, background: '#517891',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px 16px', gap: 4, height: '100vh', boxSizing: 'border-box',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 12px', flexShrink: 0 }}>
        <BurraaLogo />
        <span style={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Haazri</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/app/dashboard' && location.pathname.startsWith(item.path + '/'))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...btnBase,
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#517891' : '#EAF6FF',
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <item.Icon size={18} color={isActive ? '#517891' : '#EAF6FF'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, flexShrink: 0 }}>
        <button
          onClick={logout}
          style={{ ...btnBase, background: 'rgba(0, 0, 0, 0.15)', color: '#FFFFFF', fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#C53030'; e.currentTarget.style.color = '#FFFFFF' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'; e.currentTarget.style.color = '#FFFFFF' }}
        >
          <LogoutIcon size={16} color="#FFFFFF" />
          Logout
        </button>
      </div>
    </aside>
  )
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ user }) {
  const navigate = useNavigate()
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'User'
  const email = user?.email || ''

  return (
    <header style={{
      height: 64, background: '#FFFFFF', borderBottom: '1px solid #D7E6EF',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF',
        border: '1px solid #D7E6EF', borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 320,
      }}>
        <SearchIcon size={16} color="#8AA0AD" />
        <input
          placeholder="Search..."
          style={{ border: 'none', outline: 'none', fontSize: 14, color: '#172B3A', background: 'transparent', width: '100%' }}
        />
      </div>
      <div style={{ flex: 1 }} />
      <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 }}>
        <BellIcon size={22} color="#526B7A" />
        <span style={{
          position: 'absolute', top: 6, right: 6, width: 8, height: 8,
          background: '#1677B8', borderRadius: '50%', border: '2px solid #FFFFFF',
        }} />
      </button>
      <div
        onClick={() => navigate('/app/profile')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#EDF3F6'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #90D5FF, #57B9FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <UserAvatarSvg />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#172B3A', lineHeight: 1.2 }}>{displayName}</div>
          <div style={{ fontSize: 11, color: '#526B7A', lineHeight: 1.2 }}>{email}</div>
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7FAFC' }}>
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
