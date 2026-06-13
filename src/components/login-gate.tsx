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

// ─── macOS-style Box Login Card ─────────────────────────────
function MacOSLoginBox({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-[340px] mx-6">
      <div className="rounded-2xl bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(255,255,255,0.06)_inset] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

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
        <div className="mb-8 sm:mb-10">
          <LockScreenClock />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── SERIAL KEY STATE (new devices see this first) ── */}
          {stage === 'serial-key' && (
            <motion.div
              key="serial-key"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <MacOSLoginBox>
                {/* Top section: Avatar + identity */}
                <div className="flex flex-col items-center pt-8 pb-5 px-6">
                  {/* macOS-style avatar circle */}
                  <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#FF9500]/20 to-[#FF6B35]/20 border border-[#FF9500]/25 flex items-center justify-center mb-3.5 shadow-[0_4px_20px_rgba(255,149,0,0.15)]">
                    <Key className="size-7 text-[#FF9500]" strokeWidth={1.8} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-white/90 tracking-tight">
                    Activate BookFlow OS
                  </h2>
                  <p className="text-[12px] text-white/35 mt-0.5">
                    Enter your license key to continue
                  </p>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/[0.06] mx-5" />

                {/* Input section */}
                <div className="px-5 pt-4 pb-5 space-y-3">
                  <input
                    type="text"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    value={serialKey}
                    onChange={(e) => { setSerialKey(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleActivate)}
                    disabled={isActivating}
                    className="w-full h-9 px-3.5 rounded-lg bg-white/[0.07] border border-white/[0.06] text-white/90 placeholder:text-white/18 text-[13px] font-medium tracking-wider outline-none focus:border-[#FF9500]/35 focus:bg-white/[0.09] focus:ring-1 focus:ring-[#FF9500]/15 transition-all duration-200 text-center"
                    autoFocus
                  />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-[#FF453A] text-center flex items-center justify-center gap-1.5"
                    >
                      <span className="size-1 rounded-full bg-[#FF453A]" />
                      {error}
                    </motion.p>
                  )}

                  <button
                    onClick={handleActivate}
                    disabled={isActivating || !serialKey.trim()}
                    className="w-full h-9 rounded-lg bg-[#FF9500] text-white text-[13px] font-semibold tracking-tight shadow-[0_2px_10px_rgba(255,149,0,0.2)] hover:bg-[#FF9F0A] active:bg-[#E88E00] disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    {isActivating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-3.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Activate
                        <ArrowRight className="size-3.5" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/[0.06] mx-5" />

                {/* Demo button */}
                <div className="px-5 py-3.5">
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    className="w-full h-8 rounded-lg bg-white/[0.04] border border-white/[0.05] text-white/45 hover:text-white/65 hover:bg-white/[0.07] text-[12px] font-medium tracking-tight transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    {isLoggingIn ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-3 border-2 border-white/15 border-t-white/50 rounded-full"
                      />
                    ) : (
                      <>
                        <Sparkles className="size-3 text-[#BF5AF2]" strokeWidth={2} />
                        <span>Try Demo</span>
                        <span className="text-[7px] px-1 py-[2px] rounded bg-[#BF5AF2]/12 text-[#BF5AF2]/60 font-bold uppercase tracking-wider">View Only</span>
                      </>
                    )}
                  </button>
                </div>
              </MacOSLoginBox>
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
            >
              <MacOSLoginBox>
                <div className="flex flex-col items-center py-10 px-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-[72px] h-[72px] rounded-full bg-[#30D158]/15 border border-[#30D158]/20 flex items-center justify-center shadow-[0_4px_20px_rgba(48,209,88,0.15)]"
                  >
                    <Check className="size-8 text-[#30D158]" strokeWidth={2.5} />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[15px] font-semibold text-white/90 mt-4"
                  >
                    Device Activated
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[12px] text-white/35 mt-1"
                  >
                    Preparing sign in...
                  </motion.p>
                </div>
              </MacOSLoginBox>
            </motion.div>
          )}

          {/* ─── LOGIN STATE (macOS box-shaped) ────────────── */}
          {stage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <MacOSLoginBox>
                {/* Top section: Avatar + user identity */}
                <div className="flex flex-col items-center pt-8 pb-4 px-6">
                  {/* macOS-style large avatar */}
                  <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] flex items-center justify-center mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <User className="size-9 text-white/40" strokeWidth={1.2} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-white/90 tracking-tight">
                    Sign In
                  </h2>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Enter your credentials
                  </p>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/[0.06] mx-5" />

                {/* Form fields section */}
                <div className="px-5 pt-4 pb-4 space-y-2.5">
                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      disabled={isLoggingIn}
                      className="w-full h-9 px-3.5 rounded-lg bg-white/[0.07] border border-white/[0.06] text-white/90 placeholder:text-white/18 text-[13px] font-medium outline-none focus:border-white/[0.15] focus:bg-white/[0.09] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
                      autoFocus
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      disabled={isLoggingIn}
                      className="w-full h-9 pl-3.5 pr-9 rounded-lg bg-white/[0.07] border border-white/[0.06] text-white/90 placeholder:text-white/18 text-[13px] font-medium outline-none focus:border-white/[0.15] focus:bg-white/[0.09] focus:ring-1 focus:ring-white/[0.05] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/45 transition-colors p-0.5"
                    >
                      {showPassword ? <EyeOff className="size-3.5" strokeWidth={2} /> : <Eye className="size-3.5" strokeWidth={2} />}
                    </button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-[#FF453A] text-center flex items-center justify-center gap-1.5"
                    >
                      <span className="size-1 rounded-full bg-[#FF453A]" />
                      {error}
                    </motion.p>
                  )}

                  {/* Sign In Button */}
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn || !email.trim() || !password.trim()}
                    className="w-full h-9 rounded-lg bg-white/[0.12] border border-white/[0.08] text-white/85 text-[13px] font-semibold tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-white/[0.18] active:bg-white/[0.08] disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    {isLoggingIn ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-3.5 border-2 border-white/25 border-t-white/80 rounded-full"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="size-3.5" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/[0.06] mx-5" />

                {/* Demo button */}
                <div className="px-5 py-3.5">
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    className="w-full h-8 rounded-lg bg-white/[0.04] border border-white/[0.05] text-white/45 hover:text-white/65 hover:bg-white/[0.07] text-[12px] font-medium tracking-tight transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    {isLoggingIn ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-3 border-2 border-white/15 border-t-white/50 rounded-full"
                      />
                    ) : (
                      <>
                        <Sparkles className="size-3 text-[#BF5AF2]" strokeWidth={2} />
                        <span>Try Demo</span>
                        <span className="text-[7px] px-1 py-[2px] rounded bg-[#BF5AF2]/12 text-[#BF5AF2]/60 font-bold uppercase tracking-wider">View Only</span>
                      </>
                    )}
                  </button>
                </div>
              </MacOSLoginBox>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version & branding */}
        <div className="flex flex-col items-center mt-5 gap-0.5">
          <p className="text-[11px] text-white/18 font-medium tracking-wide">BookFlow OS v27.0</p>
          <p className="text-[10px] text-white/10">Powered by ApexFlow Ecosystem</p>
        </div>
      </div>
    </div>
  )
}
