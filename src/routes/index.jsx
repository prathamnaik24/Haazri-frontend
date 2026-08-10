import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import OrgRegister from '../pages/auth/OrgRegister'
import OrgLogin from '../pages/auth/OrgLogin'
import EmployeeLogin from '../pages/auth/EmployeeLogin'
import Dashboard from '../pages/Dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: <OrgRegister />,
  },
  {
    path: '/login',
    element: <OrgLogin />,
  },
  {
    path: '/employee-login',
    element: <EmployeeLogin />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
])
