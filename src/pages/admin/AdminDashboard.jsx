import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-brand-accent">HR Admin Portal</Link>
        </div>
        
        <nav className="flex-grow p-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-2.5 bg-slate-800 text-brand-accent font-semibold rounded-lg text-sm">
            <span className="mr-3">📊</span> Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm transition">
            <span className="mr-3">👥</span> Employees
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm transition">
            <span className="mr-3">⚠️</span> Anomaly Queue
            <span className="ml-auto px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">3</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm transition">
            <span className="mr-3">📜</span> Audit Logs
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm transition">
            <span className="mr-3">⚙️</span> Settings
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Logged in as: Admin <br />
          Company: Acme Corp
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-lg">Acme Corp Dashboard</h2>
          </div>
          <Link to="/" className="text-sm text-slate-400 hover:text-white">&larr; Main Menu</Link>
        </header>

        {/* Workspace content scroll container */}
        <main className="flex-grow p-8 overflow-y-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <p className="text-slate-400 text-sm">Present Today</p>
              <h3 className="text-3xl font-bold mt-1 text-green-400">42 / 48</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <p className="text-slate-400 text-sm">Late Checks</p>
              <h3 className="text-3xl font-bold mt-1 text-amber-400">5</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <p className="text-slate-400 text-sm">Unresolved Anomalies</p>
              <h3 className="text-3xl font-bold mt-1 text-red-400">3</h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <p className="text-slate-400 text-sm">Current Active Kiosks</p>
              <h3 className="text-3xl font-bold mt-1 text-brand-accent">2</h3>
            </div>
          </div>

          {/* Table Placeholder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold">Recent Activity</h3>
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded border border-slate-700">
                Refresh list
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="p-4 font-semibold text-white">Alice Smith</td>
                    <td className="p-4">check_in</td>
                    <td className="p-4 font-mono">08:54:12</td>
                    <td className="p-4">QR + GPS</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">Verified</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Bob Johnson</td>
                    <td className="p-4">check_in</td>
                    <td className="p-4 font-mono">09:12:05</td>
                    <td className="p-4">QR + GPS</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium border border-amber-500/20">Late (Grace)</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-white">Charlie Brown</td>
                    <td className="p-4">check_in</td>
                    <td className="p-4 font-mono">09:15:30</td>
                    <td className="p-4">GPS Mismatch</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20">Anomaly Flagged</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
