import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Auth pages
import Home from '../pages/Home'
import OrgRegister from '../pages/auth/OrgRegister'
import OrgLogin from '../pages/auth/OrgLogin'
import EmployeeLogin from '../pages/auth/EmployeeLogin'

// Employee pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import MyAttendance from '../pages/employee/MyAttendance'
import MyLeave from '../pages/employee/MyLeave'

// Manager pages
import ManagerDashboard from '../pages/manager/ManagerDashboard'
import TeamAttendance from '../pages/manager/TeamAttendance'
import LeaveApprovals from '../pages/manager/LeaveApprovals'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminEmployees from '../pages/admin/AdminEmployees'
import OrgStructure from '../pages/admin/OrgStructure'
import RolesPermissions from '../pages/admin/RolesPermissions'
import Reports from '../pages/admin/Reports'
import AuditLogs from '../pages/admin/AuditLogs'

// Finance and HR pages
import FinancePage from '../pages/finance/FinancePage'
import HRLeaves from '../pages/hr/HRLeaves'

// Shared pages
import Profile from '../pages/Profile'
import AcceptInvite from '../pages/auth/AcceptInvite'

// Generic dashboard (legacy — kept for token display)
import Dashboard from '../pages/Dashboard'

import { getUserRole } from '../utils/auth.js'

// Smart redirect based on role after login
function AppRedirect() {
  const role = getUserRole()
  if (role === 'org_admin') return <Navigate to="/app/dashboard" replace />
  if (role === 'manager')   return <Navigate to="/app/dashboard" replace />
  if (role === 'employee')  return <Navigate to="/app/dashboard" replace />
  return <Navigate to="/" replace />
}

// Role-based dashboard picker
function DashboardRouter() {
  const role = getUserRole()
  if (role === 'org_admin') return <AdminDashboard />
  if (role === 'manager')   return <ManagerDashboard />
  return <EmployeeDashboard />
}

export const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────
  { path: '/',                element: <Home /> },
  { path: '/register',        element: <OrgRegister /> },
  { path: '/login',           element: <OrgLogin /> },
  { path: '/employee-login',  element: <EmployeeLogin /> },
  { path: '/dashboard',       element: <Dashboard /> },   // legacy token viewer

  // ── App redirect after login ───────────────────────────────────────
  { path: '/app',             element: <AppRedirect /> },

  // ── Protected app routes ───────────────────────────────────────────
  { path: '/app/dashboard',       element: <DashboardRouter /> },
  { path: '/app/attendance',      element: <MyAttendance /> },
  { path: '/app/leave',           element: <MyLeave /> },

  // Manager
  { path: '/app/team-attendance', element: <TeamAttendance /> },
  { path: '/app/leave-approvals', element: <LeaveApprovals /> },

  // Admin & Manager extended
  { path: '/app/employees',       element: <AdminEmployees /> },
  { path: '/app/org-structure',   element: <OrgStructure /> },
  { path: '/app/roles',           element: <RolesPermissions /> },
  { path: '/app/reports',         element: <Reports /> },
  { path: '/app/audit-logs',      element: <AuditLogs /> },
  { path: '/app/hr-leaves',       element: <HRLeaves /> },
  { path: '/app/finance',         element: <FinancePage /> },

  // Shared
  { path: '/app/profile',         element: <Profile /> },
  { path: '/invite',              element: <AcceptInvite /> },
  { path: '/accept-invite',       element: <AcceptInvite /> },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },

  // ── TEMPORARY UI PREVIEW ROUTES (NO LOGIN REQUIRED) ────────────────
  { path: '/ui/admin',            element: <AdminDashboard /> },
  { path: '/ui/manager',          element: <ManagerDashboard /> },
  { path: '/ui/employee',         element: <EmployeeDashboard /> },
  { path: '/ui/admin-employees',  element: <AdminEmployees /> },
  { path: '/ui/leave-approvals',  element: <LeaveApprovals /> },
  { path: '/ui/team-attendance',  element: <TeamAttendance /> },
  { path: '/ui/my-attendance',    element: <MyAttendance /> },
  { path: '/ui/my-leave',         element: <MyLeave /> },
  { path: '/ui/finance',          element: <FinancePage /> },
  { path: '/ui/hr-leaves',        element: <HRLeaves /> },
  { path: '/ui/profile',          element: <Profile /> },
])
