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
  BookOpen,
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
        <div className="text-[96px] sm:text-[108px] font-extralight tracking-[-0.02em] leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
          &ndash;&ndash;:&ndash;&ndash;
        </div>
        <div className="text-[20px] sm:text-[22px] font-light text-white/80 mt-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] tracking-wide">
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
      <div className="text-[96px] sm:text-[108px] font-extralight tracking-[-0.02em] leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
        {displayHours}:{minutes}
      </div>
      <div className="text-[20px] sm:text-[22px] font-light text-white/80 mt-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] tracking-wide">
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
        // Auto-transition to login after success animation
        setTimeout(() => setStage('login'), 1500)
      } else {
        setError(data.error || 'Invalid serial key')
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
        setError(data.error || 'Invalid credentials')
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
        setError(data.error || 'Demo login failed')
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
        <div className="mb-8 sm:mb-12">
          <LockScreenClock />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── SERIAL KEY STATE (new devices see this first) ── */}
          {stage === 'serial-key' && (
            <motion.div
              key="serial-key"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center w-full max-w-[400px] px-6"
            >
              {/* Key Icon */}
              <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-full bg-white/[0.07] backdrop-blur-2xl border-[0.5px] border-white/[0.12] flex items-center justify-center shadow-[0_8px_40px_rgba(0,0,0,0.3)] mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FF9500]/20">
                  <Key className="size-5 text-[#FF9500]" strokeWidth={2} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-[19px] sm:text-[21px] font-semibold text-white/90 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                Activate Your Device
              </h2>
              <p className="text-[13px] text-white/45 mb-6 text-center max-w-[280px]">
                This device needs a serial key before you can sign in. Enter your license key below.
              </p>

              {/* Serial Key Input */}
              <div className="w-full space-y-3">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    value={serialKey}
                    onChange={(e) => { setSerialKey(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleActivate)}
                    disabled={isActivating}
                    className="w-full h-12 pl-10 pr-4 rounded-full bg-white/[0.07] backdrop-blur-xl border-[0.5px] border-white/[0.1] text-white/90 placeholder:text-white/20 text-[15px] font-medium tracking-wider outline-none focus:border-white/[0.22] focus:bg-white/[0.1] focus:ring-2 focus:ring-white/[0.06] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
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
                  className="w-full h-12 rounded-full bg-[#FF9500]/80 backdrop-blur-xl border-[0.5px] border-[#FF9500]/30 text-white text-[15px] font-semibold tracking-tight shadow-[0_4px_20px_rgba(255,149,0,0.2)] hover:bg-[#FF9500] hover:border-[#FF9500]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isActivating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Activate Device
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </>
                  )}
                </button>

                {/* Separator */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[11px] text-white/20 bg-transparent">or explore</span>
                  </div>
                </div>

                {/* Demo Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-full bg-white/[0.04] border-[0.5px] border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.07] hover:border-white/[0.1] text-[15px] font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2.5"
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-white/20 border-t-white/60 rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="size-4 text-[#BF5AF2]" strokeWidth={2} />
                      <span>Try Demo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/20 text-[#BF5AF2]/80 font-bold uppercase tracking-wider">View Only</span>
                    </>
                  )}
                </button>
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
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-[80px] h-[80px] rounded-full bg-[#30D158]/20 border-[0.5px] border-[#30D158]/30 flex items-center justify-center shadow-[0_8px_40px_rgba(48,209,88,0.15)]"
              >
                <Check className="size-9 text-[#30D158]" strokeWidth={2.5} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[17px] font-semibold text-white/90 mt-4 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              >
                Device Activated
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[13px] text-white/45 mt-1"
              >
                Preparing sign in...
              </motion.p>
            </motion.div>
          )}

          {/* ─── LOGIN STATE ───────────────────────────────────── */}
          {stage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center w-full max-w-[400px] px-6"
            >
              {/* User Avatar */}
              <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-full bg-white/[0.07] backdrop-blur-2xl border-[0.5px] border-white/[0.12] flex items-center justify-center shadow-[0_8px_40px_rgba(0,0,0,0.3)] mb-4">
                <User className="size-9 sm:size-10 text-white/60" strokeWidth={1.3} />
              </div>

              {/* User Name */}
              <h2 className="text-[19px] sm:text-[21px] font-semibold text-white/90 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                Sign In
              </h2>
              <p className="text-[13px] text-white/45 mb-6">
                Enter your credentials to continue
              </p>

              {/* Login Fields */}
              <div className="w-full space-y-3">
                {/* Email Field */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" strokeWidth={2} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    disabled={isLoggingIn}
                    className="w-full h-12 pl-10 pr-4 rounded-full bg-white/[0.07] backdrop-blur-xl border-[0.5px] border-white/[0.1] text-white/90 placeholder:text-white/20 text-[15px] font-medium outline-none focus:border-white/[0.22] focus:bg-white/[0.1] focus:ring-2 focus:ring-white/[0.06] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    autoFocus
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" strokeWidth={2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    disabled={isLoggingIn}
                    className="w-full h-12 pl-10 pr-12 rounded-full bg-white/[0.07] backdrop-blur-xl border-[0.5px] border-white/[0.1] text-white/90 placeholder:text-white/20 text-[15px] font-medium outline-none focus:border-white/[0.22] focus:bg-white/[0.1] focus:ring-2 focus:ring-white/[0.06] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
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
                  className="w-full h-12 rounded-full bg-white/[0.14] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 text-[15px] font-semibold tracking-tight shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.2] hover:border-white/[0.2] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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

                {/* Separator */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[11px] text-white/20 bg-transparent">or</span>
                  </div>
                </div>

                {/* Demo Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-full bg-white/[0.04] border-[0.5px] border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.07] hover:border-white/[0.1] text-[15px] font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2.5"
                >
                  {isLoggingIn ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-white/20 border-t-white/60 rounded-full"
                    />
                  ) : (
                    <>
                      <Sparkles className="size-4 text-[#BF5AF2]" strokeWidth={2} />
                      <span>Try Demo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/20 text-[#BF5AF2]/80 font-bold uppercase tracking-wider">View Only</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-10 left-0 right-0 flex flex-col items-center"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="size-3 text-white/25" strokeWidth={2} />
            <span className="text-[11px] text-white/30 font-medium tracking-wide">ApexFlow Ecosystem</span>
          </div>
          <p className="text-[10px] text-white/20">BookFlow OS v27.0 · Retina</p>
        </motion.div>
      </div>
    </div>
  )
}
