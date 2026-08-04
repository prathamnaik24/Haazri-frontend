import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import AdminDashboard from '../pages/admin/AdminDashboard'
import KioskView from '../pages/kiosk/KioskView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/employee',
    element: <EmployeeDashboard />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/kiosk',
    element: <KioskView />,
  },
])
