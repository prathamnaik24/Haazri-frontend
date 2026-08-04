import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-slate-900 text-white px-4 py-8">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-accent tracking-tight">
          Attendance System
        </h1>
        <p className="text-slate-400 text-lg">
          Scaffold project shells. Select a platform to preview the interface structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <Link
            to="/employee"
            className="flex flex-col items-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-accent rounded-xl transition-all duration-200"
          >
            <span className="text-3xl mb-2">📱</span>
            <span className="font-semibold text-lg">Employee PWA</span>
            <span className="text-xs text-slate-400 mt-1">Mobile Web View</span>
          </Link>

          <Link
            to="/admin"
            className="flex flex-col items-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-accent rounded-xl transition-all duration-200"
          >
            <span className="text-3xl mb-2">📊</span>
            <span className="font-semibold text-lg">Admin / HR</span>
            <span className="text-xs text-slate-400 mt-1">Management Panel</span>
          </Link>

          <Link
            to="/kiosk"
            className="flex flex-col items-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-accent rounded-xl transition-all duration-200"
          >
            <span className="text-3xl mb-2">🖥️</span>
            <span className="font-semibold text-lg">Office Kiosk</span>
            <span className="text-xs text-slate-400 mt-1">QR Display Screen</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
