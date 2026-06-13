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
  BatteryCharging,
  Accessibility,
  Power,
  Monitor,
  Sparkles,
  Shield,
  User,
  ChevronUp,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
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

  // Don't render until client-side hydration is complete
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

// ─── Star Field (client-side only to avoid hydration mismatch) ──
function StarField() {
  const [stars, setStars] = React.useState<Array<{
    w: number; h: number; top: number; left: number;
    opacity: number; duration: number; delay: number;
  }>>([])

  React.useEffect(() => {
    // Use a seeded approach via index to stay deterministic per render cycle,
    // but only compute on the client to avoid SSR/client mismatch
    const generated = Array.from({ length: 80 }, (_, i) => {
      // Simple seeded pseudo-random based on index
      const seed = (i * 2654435761) >>> 0
      const rand = (offset: number) => ((seed + offset) % 10000) / 10000
      return {
        w: rand(0) * 2 + 0.5,
        h: rand(1000) * 2 + 0.5,
        top: rand(2000) * 45,
        left: rand(3000) * 100,
        opacity: rand(4000) * 0.5 + 0.15,
        duration: rand(5000) * 4 + 2,
        delay: rand(6000) * 3,
      }
    })
    setStars(generated)
  }, [])

  return (
    <div className="absolute inset-0">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${s.w}px`,
            height: `${s.h}px`,
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Golden Gate Wallpaper ─────────────────────────────────────
function GoldenGateWallpaper() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient - Golden Gate sunset */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0533] via-[#2d1569] to-[#0f0c29]" />

      {/* Warm horizon glow */}
      <div className="absolute bottom-[20%] left-0 right-0 h-[30%] bg-gradient-to-t from-[#FF6B35]/15 via-[#FF9500]/8 to-transparent" />

      {/* Fog layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/3 via-transparent to-transparent" />

      {/* Golden Gate Bridge silhouette - CSS art */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]">
        {/* Water */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-b from-[#1a2744]/70 to-[#0d1926]/90" />

        {/* Water reflections — deterministic values to avoid hydration mismatch */}
        <div className="absolute bottom-0 left-0 right-0 h-[15%]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B35]/5 to-transparent" />
          {[7.2, 10.5, 5.8, 12.1, 6.4, 9.3, 8.7, 11.2].map((w, i) => (
            <div
              key={i}
              className="absolute bottom-0 h-[1px] bg-white/5"
              style={{
                left: `${10 + i * 10}%`,
                width: `${w}%`,
                opacity: [0.35, 0.42, 0.38, 0.55, 0.31, 0.48, 0.36, 0.52][i],
              }}
            />
          ))}
        </div>

        {/* Fog over water */}
        <div className="absolute bottom-[20%] left-0 right-0 h-[25%] bg-gradient-to-t from-[#2d1b69]/20 via-[#4a2c8a]/8 to-transparent" />

        {/* Bridge deck */}
        <div className="absolute bottom-[38%] left-0 right-0 h-[3px] bg-[#c0392b]/80" />

        {/* Left tower */}
        <div className="absolute bottom-[25%] left-[22%] w-[6px] h-[28%] bg-[#c0392b]/90 rounded-t-sm">
          <div className="absolute -top-[4px] -left-[2px] w-[10px] h-[4px] bg-[#c0392b]/90 rounded-t" />
        </div>

        {/* Right tower */}
        <div className="absolute bottom-[25%] right-[22%] w-[6px] h-[28%] bg-[#c0392b]/90 rounded-t-sm">
          <div className="absolute -top-[4px] -left-[2px] w-[10px] h-[4px] bg-[#c0392b]/90 rounded-t" />
        </div>

        {/* Suspension cables */}
        <svg className="absolute bottom-[38%] left-0 right-0 h-[30%]" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path d="M 0 200 Q 220 0, 220 0" stroke="#c0392b" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 220 0 Q 500 180, 780 0" stroke="#c0392b" strokeWidth="2" fill="none" opacity="0.7" />
          <path d="M 780 0 Q 780 0, 1000 200" stroke="#c0392b" strokeWidth="1.5" fill="none" opacity="0.6" />
          {Array.from({ length: 20 }, (_, i) => {
            const x = 50 + i * 45
            let y
            if (x < 220) {
              y = 200 - (200 * (x / 220))
            } else if (x < 780) {
              const mid = (x - 220) / (780 - 220)
              y = 200 - (200 * (1 - 4 * (mid - 0.5) * (mid - 0.5)))
              y = Math.min(y, 200)
            } else {
              y = 200 - (200 * ((1000 - x) / 220))
            }
            return (
              <line key={i} x1={x} y1={y} x2={x} y2={200} stroke="#c0392b" strokeWidth="0.5" opacity="0.35" />
            )
          })}
        </svg>
      </div>

      {/* Stars — generated client-side only to avoid hydration mismatch */}
      {isDark && <StarField />}

      {/* Ambient light overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9500]/5 via-transparent to-[#AF52DE]/5" />

      {isDark && <div className="absolute inset-0 bg-black/30" />}

      {/* Blur overlay for lock screen depth */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />

      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />
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
type LoginStage = 'initial' | 'serial-key' | 'login' | 'loading'

// ─── Login Gate Component (macOS 27 Lock Screen) ──────────────
export function LoginGate() {
  const { setAuth, setDeviceActivated } = useAppStore()
  const [stage, setStage] = React.useState<LoginStage>('initial')
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
        setStage('login')
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
      <GoldenGateWallpaper />

      {/* Bottom Status Bar */}
      <LockScreenStatusBar />

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full">

        {/* ─── INITIAL STATE: Lock Screen ─────────────────────── */}
        <AnimatePresence mode="wait">
          {stage === 'initial' && (
            <motion.div
              key="lock-initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center"
            >
              {/* Large Clock */}
              <div className="mb-12 sm:mb-16">
                <LockScreenClock />
              </div>

              {/* User Avatar */}
              <motion.button
                onClick={() => setStage('serial-key')}
                className="group flex flex-col items-center gap-3"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] rounded-full bg-white/[0.08] backdrop-blur-2xl border-[0.5px] border-white/[0.15] flex items-center justify-center shadow-[0_8px_40px_rgba(0,0,0,0.3)] group-hover:bg-white/[0.12] group-hover:border-white/[0.25] transition-all duration-300">
                  <User className="size-9 sm:size-10 text-white/70 group-hover:text-white/90 transition-colors duration-300" strokeWidth={1.3} />
                </div>
                <div className="text-center">
                  <p className="text-[17px] sm:text-[19px] font-semibold text-white/90 group-hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                    BookFlow OS
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <ChevronUp className="size-3 text-white/40 group-hover:text-white/60 transition-colors animate-bounce" strokeWidth={2} />
                    <p className="text-[12px] text-white/40 group-hover:text-white/60 transition-colors">Click to unlock</p>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* ─── SERIAL KEY STATE ──────────────────────────────── */}
          {stage === 'serial-key' && (
            <motion.div
              key="serial-key"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center w-full max-w-[380px] px-6"
            >
              {/* User Avatar (smaller) */}
              <div className="w-[64px] h-[64px] rounded-full bg-white/[0.08] backdrop-blur-2xl border-[0.5px] border-white/[0.15] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF9500]/20">
                  <Key className="size-4 text-[#FF9500]" strokeWidth={2} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-[17px] font-semibold text-white/90 mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                Activate Your Device
              </h2>
              <p className="text-[13px] text-white/50 mb-5">
                Enter your serial key to continue
              </p>

              {/* Serial Key Input - macOS pill style */}
              <div className="w-full space-y-3">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="BF-XXX-2027-XXXX"
                    value={serialKey}
                    onChange={(e) => { setSerialKey(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleActivate)}
                    disabled={isActivating}
                    className="w-full h-12 pl-10 pr-4 rounded-full bg-white/[0.08] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 placeholder:text-white/25 text-[15px] font-medium tracking-wide outline-none focus:border-white/[0.25] focus:bg-white/[0.12] focus:ring-2 focus:ring-white/[0.08] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
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

                {/* Activate Button - macOS pill */}
                <button
                  onClick={handleActivate}
                  disabled={isActivating || !serialKey.trim()}
                  className="w-full h-12 rounded-full bg-white/[0.15] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 text-[15px] font-semibold tracking-tight shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.2] hover:border-white/[0.2] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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

                {/* Separator */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.06]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[11px] text-white/25">or explore</span>
                  </div>
                </div>

                {/* Demo Login - macOS secondary style */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-full bg-white/[0.04] border-[0.5px] border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] text-[15px] font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2.5"
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
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/20 text-[#BF5AF2]/90 font-bold uppercase tracking-wider">View Only</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── LOGIN STATE ───────────────────────────────────── */}
          {stage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center w-full max-w-[380px] px-6"
            >
              {/* User Avatar */}
              <div className="w-[72px] h-[72px] rounded-full bg-white/[0.08] backdrop-blur-2xl border-[0.5px] border-white/[0.15] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] mb-3">
                <User className="size-8 text-white/70" strokeWidth={1.3} />
              </div>

              {/* User Name */}
              <h2 className="text-[17px] font-semibold text-white/90 mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                Sign In
              </h2>
              <p className="text-[13px] text-white/50 mb-5">
                Enter your credentials to continue
              </p>

              {/* Login Fields */}
              <div className="w-full space-y-3">
                {/* Email Field - macOS pill */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" strokeWidth={2} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    disabled={isLoggingIn}
                    className="w-full h-12 pl-10 pr-4 rounded-full bg-white/[0.08] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 placeholder:text-white/25 text-[15px] font-medium outline-none focus:border-white/[0.25] focus:bg-white/[0.12] focus:ring-2 focus:ring-white/[0.08] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                    autoFocus
                  />
                </div>

                {/* Password Field - macOS pill */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/25" strokeWidth={2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                    disabled={isLoggingIn}
                    className="w-full h-12 pl-10 pr-12 rounded-full bg-white/[0.08] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 placeholder:text-white/25 text-[15px] font-medium outline-none focus:border-white/[0.25] focus:bg-white/[0.12] focus:ring-2 focus:ring-white/[0.08] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
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

                {/* Sign In Button - macOS pill */}
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn || !email.trim() || !password.trim()}
                  className="w-full h-12 rounded-full bg-white/[0.15] backdrop-blur-xl border-[0.5px] border-white/[0.12] text-white/90 text-[15px] font-semibold tracking-tight shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.2] hover:border-white/[0.2] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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
                    <span className="px-3 text-[11px] text-white/25">or</span>
                  </div>
                </div>

                {/* Demo Login */}
                <button
                  onClick={handleDemoLogin}
                  disabled={isLoggingIn}
                  className="w-full h-12 rounded-full bg-white/[0.04] border-[0.5px] border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] text-[15px] font-medium tracking-tight transition-all duration-200 flex items-center justify-center gap-2.5"
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
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#BF5AF2]/20 text-[#BF5AF2]/90 font-bold uppercase tracking-wider">View Only</span>
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
          <p className="text-[10px] text-white/20">BookFlow OS v27.0 · Golden Gate · Retina</p>
        </motion.div>
      </div>

      {/* CSS Animation for stars */}
      <style jsx>{`
        @keyframes twinkle {
          from { opacity: 0.15; }
          to { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
