'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Key,
  ArrowRight,
  Eye,
  EyeOff,
  Wifi,
  Battery,
  Accessibility,
  Power,
  Sparkles,
  User,
  Check,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'

// ─── macOS 27 Lock Screen Clock ────────────────────────────────
function LockScreenClock() {
  const [time, setTime] = React.useState<Date | null>(null)

  React.useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  if (!time) {
    return (
      <div className="text-center select-none">
        <div className="text-[72px] sm:text-[84px] font-extralight tracking-[-0.02em] leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          &ndash;&ndash;:&ndash;&ndash;
        </div>
        <div className="text-[18px] sm:text-[20px] font-light text-white/70 mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] tracking-wide">
          &nbsp;
        </div>
      </div>
    )
  }

  const hours = time.getHours()
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const displayHours = hours % 12 || 12

  return (
    <div className="text-center select-none">
      <div className="text-[72px] sm:text-[84px] font-extralight tracking-[-0.02em] leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
        {displayHours}:{minutes}
      </div>
      <div className="text-[18px] sm:text-[20px] font-light text-white/70 mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] tracking-wide">
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}
      </div>
    </div>
  )
}

// ─── Color-only Wallpaper (no bridge, no images) ──────────────
function ColorWallpaper() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient — deep navy to midnight */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e] via-[#1a1a4e] to-[#0d0d2a]" />

      {/* Warm accent glow — bottom left */}
      <div className="absolute bottom-0 left-0 w-[60%] h-[50%] bg-gradient-to-tr from-[#FF6B35]/10 via-[#FF9500]/5 to-transparent rounded-full blur-3xl" />

      {/* Cool accent glow — top right */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-[#5856D6]/10 via-[#AF52DE]/5 to-transparent rounded-full blur-3xl" />

      {/* Teal accent — center bottom */}
      <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gradient-to-t from-[#30D5C8]/6 to-transparent rounded-full blur-3xl" />

      {/* Subtle horizon line */}
      <div className="absolute bottom-[25%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      {/* Ambient light overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9500]/3 via-transparent to-[#AF52DE]/3" />

      {/* Dark mode extra depth */}
      {isDark && <div className="absolute inset-0 bg-black/20" />}

      {/* Light mode softer palette */}
      {!isDark && <div className="absolute inset-0 bg-gradient-to-b from-[#4a3f8a]/40 via-[#6b5fb0]/30 to-[#3d3680]/50" />}

      {/* Soft blur for depth */}
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  )
}

// ─── Bottom Status Bar (macOS lock screen style) ───────────────
function LockScreenStatusBar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between h-[32px] px-5 bg-black/10 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Wifi className="size-3.5 text-white/50" strokeWidth={2} />
        <Battery className="size-4 text-white/50" strokeWidth={2} />
      </div>
      <div className="flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="text-[12px] text-white/50 hover:text-white/80 transition-colors"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        )}
        <Accessibility className="size-3.5 text-white/50 hover:text-white/70 cursor-pointer transition-colors" strokeWidth={2} />
        <Power className="size-3.5 text-white/50 hover:text-white/70 cursor-pointer transition-colors" strokeWidth={2} />
      </div>
    </div>
  )
}

// ─── Login Stage Types ────────────────────────────────────────
type LoginStage = 'serial-key' | 'login' | 'activation-success'

// ─── Login Gate Component (macOS 27 Lock Screen) ──────────────
export function LoginGate() {
  const { setAuth, setDeviceActivated } = useAppStore()
  const [stage, setStage] = React.useState<LoginStage>('serial-key')
  const [serialKey, setSerialKey] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isActivating, setIsActivating] = React.useState(false)
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)

  // Check if device is already activated
  React.useEffect(() => {
    const activated = localStorage.getItem('bf_device_activated')
    if (activated === 'true') {
      setDeviceActivated(true)
      setStage('login')
    }
  }, [setDeviceActivated])

  // Check if already authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('bf_auth_token')
    const userStr = localStorage.getItem('bf_auth_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setAuth(data.user, token)
            } else {
              localStorage.removeItem('bf_auth_token')
              localStorage.removeItem('bf_auth_user')
            }
          })
          .catch(() => {
            localStorage.removeItem('bf_auth_token')
            localStorage.removeItem('bf_auth_user')
          })
      } catch {
        localStorage.removeItem('bf_auth_token')
        localStorage.removeItem('bf_auth_user')
      }
    }
  }, [setAuth])

  const handleActivate = async () => {
    if (!serialKey.trim()) {
      setError('Please enter a serial key')
      return
    }
    setIsActivating(true)
    setError('')
    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: serialKey.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('bf_device_activated', 'true')
        setDeviceActivated(true)
        setStage('activation-success')
        setTimeout(() => setStage('login'), 1500)
      } else {
        setError(data.error || data.message || 'Invalid serial key')
      }
    } catch {
      setError('Failed to activate. Please try again.')
    } finally {
      setIsActivating(false)
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }
    setIsLoggingIn(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('bf_auth_token', data.token)
        localStorage.setItem('bf_auth_user', JSON.stringify(data.user))
        setAuth(data.user, data.token)
      } else {
        setError(data.error || data.message || 'Invalid credentials')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoggingIn(true)
    setError('')
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('bf_auth_token', data.token)
        localStorage.setItem('bf_auth_user', JSON.stringify(data.user))
        localStorage.setItem('bf_device_activated', 'true')
        setDeviceActivated(true)
        setAuth(data.user, data.token)
      } else {
        setError(data.error || data.message || 'Demo login failed')
      }
    } catch {
      setError('Demo login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none cursor-default">
      <ColorWallpaper />

      {/* Bottom Status Bar */}
      <LockScreenStatusBar />

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full">

        {/* Clock — always visible at top */}
        <div className="mb-6 sm:mb-8">
          <LockScreenClock />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── SERIAL KEY STATE (new devices see this first) ── */}
          {stage === 'serial-key' && (
            <motion.div
              key="serial-key"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-[380px] mx-6"
            >
              {/* macOS Frosted Glass Card */}
              <div className="rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.05)_inset] p-8">
                {/* Avatar + Title */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-[64px] h-[64px] rounded-full bg-[#FF9500]/15 border border-[#FF9500]/20 flex items-center justify-center mb-3">
                    <Key className="size-6 text-[#FF9500]" strokeWidth={2} />
                  </div>
                  <h2 className="text-[17px] font-semibold text-white/90 mb-0.5">
                    Activate Your Device
                  </h2>
                  <p className="text-[13px] text-white/40 text-center">
                    Enter your license key to continue
                  </p>
                </div>

                {/* Serial Key Input */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    value={serialKey}
                    onChange={(e) => { setSerialKey(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleActivate)}
                    disabled={isActivating}
                    className="w-full h-11 px-4 rounded-xl bg-black/20 border border-white/[0.08] text-white/90 placeholder:text-white/20 text-[14px] font-medium tracking-wider outline-none focus:border-[#FF9500]/40 focus:bg-black/25 focus:ring-1 focus:ring-[#FF9500]/20 transition-all duration-200 text-center"
                    autoFocus
                  />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[#FF453A] text-center flex items-center justify-center gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-[#FF453A]" />
                      {error}
                    </motion.p>
                  )}

                  {/* Activate Button */}
                  <button
                    onClick={handleActivate}
                    disabled={isActivating || !serialKey.trim()}
                    className="w-full h-11 rounded-xl bg-[#FF9500] text-white text-[14px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(255,149,0,0.25)] hover:bg-[#FF9F0A] active:bg-[#E88E00] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {isActivating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Activate
                        <ArrowRight className="size-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[11px] text-white/20 bg-[rgba(255,255,255,0.08)] backdrop-blur-xl">or</span>
                  </div>
                </div>

                {/* Demo Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-11 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.1] text-[14px] font-medium tracking-tight transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-white/20 border-t-white/60 rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="size-3.5 text-[#BF5AF2]" strokeWidth={2} />
                      <span>Try Demo</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/15 text-[#BF5AF2]/70 font-bold uppercase tracking-wider">View Only</span>
                    </>
                  )}
                </button>
              </div>

              {/* Version & branding — outside card */}
              <div className="flex flex-col items-center pt-4 gap-0.5">
                <p className="text-[11px] text-white/20 font-medium tracking-wide">BookFlow OS v27.0</p>
                <p className="text-[10px] text-white/12">Powered by ApexFlow Ecosystem</p>
              </div>
            </motion.div>
          )}

          {/* ─── ACTIVATION SUCCESS (brief animation) ─────────── */}
          {stage === 'activation-success' && (
            <motion.div
              key="activation-success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-[300px] mx-6"
            >
              <div className="rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-[64px] h-[64px] rounded-full bg-[#30D158]/15 border border-[#30D158]/20 flex items-center justify-center"
                >
                  <Check className="size-7 text-[#30D158]" strokeWidth={2.5} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-[17px] font-semibold text-white/90 mt-4"
                >
                  Device Activated
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[13px] text-white/40 mt-1"
                >
                  Preparing sign in...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ─── LOGIN STATE ───────────────────────────────────── */}
          {stage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-[380px] mx-6"
            >
              {/* macOS Frosted Glass Card */}
              <div className="rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.05)_inset] p-8">
                {/* Avatar + Title */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-[64px] h-[64px] rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center mb-3">
                    <User className="size-7 text-white/50" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[17px] font-semibold text-white/90 mb-0.5">
                    Sign In
                  </h2>
                  <p className="text-[13px] text-white/40">
                    Enter your credentials to continue
                  </p>
                </div>

                {/* Login Fields */}
                <div className="space-y-3">
                  {/* Email Field */}
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    disabled={isLoggingIn}
                    className="w-full h-11 px-4 rounded-xl bg-black/20 border border-white/[0.08] text-white/90 placeholder:text-white/20 text-[14px] font-medium outline-none focus:border-white/[0.18] focus:bg-black/25 focus:ring-1 focus:ring-white/[0.06] transition-all duration-200"
                    autoFocus
                  />

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      disabled={isLoggingIn}
                      className="w-full h-11 pl-4 pr-11 rounded-xl bg-black/20 border border-white/[0.08] text-white/90 placeholder:text-white/20 text-[14px] font-medium outline-none focus:border-white/[0.18] focus:bg-black/25 focus:ring-1 focus:ring-white/[0.06] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
                    </button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[#FF453A] text-center flex items-center justify-center gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-[#FF453A]" />
                      {error}
                    </motion.p>
                  )}

                  {/* Sign In Button */}
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn || !email.trim() || !password.trim()}
                    className="w-full h-11 rounded-xl bg-white/[0.15] border border-white/[0.1] text-white/90 text-[14px] font-semibold tracking-tight shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-white/[0.22] active:bg-white/[0.10] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="size-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[11px] text-white/20 bg-[rgba(255,255,255,0.08)] backdrop-blur-xl">or</span>
                  </div>
                </div>

                {/* Demo Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-11 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.1] text-[14px] font-medium tracking-tight transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-white/20 border-t-white/60 rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="size-3.5 text-[#BF5AF2]" strokeWidth={2} />
                      <span>Try Demo</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/15 text-[#BF5AF2]/70 font-bold uppercase tracking-wider">View Only</span>
                    </>
                  )}
                </button>
              </div>

              {/* Version & branding — outside card */}
              <div className="flex flex-col items-center pt-4 gap-0.5">
                <p className="text-[11px] text-white/20 font-medium tracking-wide">BookFlow OS v27.0</p>
                <p className="text-[10px] text-white/12">Powered by ApexFlow Ecosystem</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
