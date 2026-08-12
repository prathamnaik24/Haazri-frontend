import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function EmployeeDashboard() {
  const [healthStatus, setHealthStatus] = useState('Checking connection to backend...')
  
  // Health check placeholder function
  const checkHealth = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/health')
      if (res.ok) {
        const data = await res.json()
        setHealthStatus(`Connected to backend. Status: ${data.status}`)
      } else {
        setHealthStatus('Backend returned an error.')
      }
    } catch (e) {
      setHealthStatus('Could not reach backend. Verify server is running at port 5001.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white max-w-md mx-auto border-x border-slate-800 shadow-2xl">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur sticky top-0">
        <Link to="/" className="text-slate-400 hover:text-white">&larr; Back</Link>
        <span className="font-bold text-brand-accent">Employee Portal</span>
        <div className="w-8 h-8 rounded-full bg-brand-mid flex items-center justify-center font-bold text-xs">JD</div>
      </header>

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">John Doe</h2>
              <p className="text-xs text-slate-400">Software Engineer (EMP-10023)</p>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">Active</span>
          </div>
          
          <div className="border-t border-slate-700 pt-4 flex justify-between text-sm">
            <div>
              <p className="text-slate-400 text-xs">Office Base</p>
              <p className="font-semibold">Mumbai HQ</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Today's Shift</p>
              <p className="font-semibold text-brand-accent">General (09:00 - 18:00)</p>
            </div>
          </div>
        </div>

        {/* Action Button Placeholder */}
        <div className="space-y-3">
          <button className="w-full bg-brand-accent text-slate-900 hover:bg-opacity-90 font-bold py-4 px-4 rounded-xl shadow-lg shadow-brand-accent/20 transition duration-150 flex items-center justify-center space-x-2">
            <span className="text-lg">📷</span>
            <span>Scan Office QR Code</span>
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-slate-800 hover:bg-slate-750 border border-slate-700 py-3 rounded-xl text-sm font-semibold">
              ☕ Start Break
            </button>
            <button className="bg-slate-800 hover:bg-slate-750 border border-slate-700 py-3 rounded-xl text-sm font-semibold">
              🚩 Manual Check-in
            </button>
          </div>
        </div>

        {/* Backend Stack Status block */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">System Integration Status</h3>
          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-850">
            {healthStatus}
          </p>
          <button 
            onClick={checkHealth}
            className="text-xs text-brand-accent hover:underline font-semibold"
          >
            Test backend endpoint connection
          </button>
        </div>
      </main>

      <footer className="p-4 border-t border-slate-800 bg-slate-900 text-center text-xs text-slate-500">
        Attendance System v0.1.0 • PWA Mobile Wrapper Shell
      </footer>
    </div>
  )
}
