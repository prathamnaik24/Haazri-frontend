import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function KioskView() {
  const [seconds, setSeconds] = useState(15)
  const [tokenHash, setTokenHash] = useState('scaffold_rotating_qr_token_hash_value_1')

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Rotate token
          setTokenHash(`scaffold_rotating_qr_token_hash_value_${Math.floor(Math.random() * 1000)}`)
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-8 kiosk-container">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-brand-accent tracking-wider uppercase">Acme Mumbai Office</h1>
          <p className="text-sm text-slate-400">Entrance Kiosk Node #1</p>
        </div>
        <Link 
          to="/" 
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition"
        >
          Exit Kiosk Mode
        </Link>
      </header>

      {/* Main QR Core View */}
      <main className="flex flex-col items-center justify-center space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-brand-accent/5 flex flex-col items-center space-y-4 border-4 border-brand-accent">
          {/* Simulated QR Code using CSS grid */}
          <div className="w-64 h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden rounded-xl border border-slate-200">
            {/* Draw dummy QR grids */}
            <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-2 opacity-80">
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
              
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-200"></div>
              <div className="bg-slate-900 rounded"></div>
              <div className="bg-slate-900 rounded"></div>
            </div>
            {/* Center indicator logo */}
            <div className="w-16 h-16 bg-brand-navy rounded-2xl flex items-center justify-center shadow-lg border-2 border-white z-10">
              <span className="text-xl">🛡️</span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 select-all">{tokenHash}</span>
        </div>

        {/* Progress Countdown indicators */}
        <div className="w-full max-w-sm space-y-2 text-center">
          <div className="flex justify-between items-center px-2 text-sm text-slate-400">
            <span>Rotating token code</span>
            <span className="font-bold text-brand-accent">{seconds}s left</span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto border border-slate-700">
            <div 
              className="h-full bg-brand-accent transition-all duration-1000 ease-linear"
              style={{ width: `${(seconds / 15) * 100}%` }}
            ></div>
          </div>
        </div>
      </main>

      {/* Footer instruction guidelines */}
      <footer className="max-w-md text-center space-y-2">
        <p className="text-base text-slate-200 font-semibold">Please scan this QR code using your PWA application</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          This token is rotation-locked and dynamically signed. Forwarded screenshots will expire immediately.
        </p>
      </footer>
    </div>
  )
}
