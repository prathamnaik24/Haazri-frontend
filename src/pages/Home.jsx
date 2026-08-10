import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-slate-900 text-white px-4 py-8 min-h-screen">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-accent tracking-tight mb-4">
            Attendance System
          </h1>
          <p className="text-slate-400 text-lg">
            Week 2 Demo: Multi-tenant Auth & Hierarchy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">For Organizations</h2>
            <p className="text-slate-400 text-sm flex-grow">
              Register a new organization or log in as an existing administrator.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/register" className="bg-brand-accent text-white py-2 rounded font-semibold hover:bg-opacity-90">
                Register Organization
              </Link>
              <Link to="/login" className="bg-slate-700 text-white py-2 rounded font-semibold hover:bg-slate-600">
                Admin Login
              </Link>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">For Employees</h2>
            <p className="text-slate-400 text-sm flex-grow">
              Log in to your organization's workspace to mark attendance and request leaves.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/employee-login" className="bg-brand-accent text-white py-2 rounded font-semibold hover:bg-opacity-90 mt-auto">
                Employee Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
