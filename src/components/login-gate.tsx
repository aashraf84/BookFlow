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
  Monitor,
  Sparkles,
  Shield,
  Clock,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/app-store'

// ─── macOS Clock ──────────────────────────────────────────────
function MacClock() {
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="text-center mb-8 select-none">
      <div className="text-[86px] font-extralight tracking-tight leading-none text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        {displayHours}:{minutes}
        <span className="text-[32px] font-light ml-1 text-white/80">{ampm}</span>
      </div>
      <div className="text-[17px] font-medium text-white/80 mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}
      </div>
    </div>
  )
}

// ─── Golden Gate Background ───────────────────────────────────
function GoldenGateBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - Golden Gate inspired */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#2d1b69] to-[#0f0c29]" />

      {/* Fog layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent" />

      {/* Golden Gate Bridge silhouette - CSS art */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]">
        {/* Water */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-b from-[#1a2744]/60 to-[#0d1926]/80" />

        {/* Fog over water */}
        <div className="absolute bottom-[20%] left-0 right-0 h-[25%] bg-gradient-to-t from-[#2d1b69]/30 via-[#4a2c8a]/10 to-transparent" />

        {/* Bridge deck */}
        <div className="absolute bottom-[38%] left-0 right-0 h-[3px] bg-[#c0392b]/70" />

        {/* Left tower */}
        <div className="absolute bottom-[25%] left-[22%] w-[6px] h-[28%] bg-[#c0392b]/80 rounded-t-sm">
          {/* Tower top */}
          <div className="absolute -top-[4px] -left-[2px] w-[10px] h-[4px] bg-[#c0392b]/80 rounded-t" />
        </div>

        {/* Right tower */}
        <div className="absolute bottom-[25%] right-[22%] w-[6px] h-[28%] bg-[#c0392b]/80 rounded-t-sm">
          <div className="absolute -top-[4px] -left-[2px] w-[10px] h-[4px] bg-[#c0392b]/80 rounded-t" />
        </div>

        {/* Suspension cables - left side */}
        <svg className="absolute bottom-[38%] left-0 right-0 h-[30%]" viewBox="0 0 1000 200" preserveAspectRatio="none">
          {/* Main cable */}
          <path d="M 0 200 Q 220 0, 220 0" stroke="#c0392b" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M 220 0 Q 500 180, 780 0" stroke="#c0392b" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 780 0 Q 780 0, 1000 200" stroke="#c0392b" strokeWidth="1.5" fill="none" opacity="0.5" />

          {/* Vertical cables */}
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
              <line key={i} x1={x} y1={y} x2={x} y2={200} stroke="#c0392b" strokeWidth="0.5" opacity="0.3" />
            )
          })}
        </svg>
      </div>

      {/* Stars for night mode */}
      {isDark && (
        <div className="absolute inset-0">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                top: `${Math.random() * 40}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 3}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient light overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9500]/5 via-transparent to-[#AF52DE]/5" />

      {/* Dark mode deeper overlay */}
      {isDark && <div className="absolute inset-0 bg-black/30" />}

      {/* Noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  )
}

// ─── Login Stage Types ────────────────────────────────────────
type LoginStage = 'initial' | 'serial-key' | 'login' | 'loading'

// ─── Login Gate Component ─────────────────────────────────────
export function LoginGate() {
  const { setAuth, setDeviceActivated } = useAppStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [stage, setStage] = React.useState<LoginStage>('initial')
  const [serialKey, setSerialKey] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isActivating, setIsActivating] = React.useState(false)
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

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
        // Verify session
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

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none">
      <GoldenGateBackground />

      {/* macOS Menu Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between h-[30px] px-4 glass-thin bg-black/20">
        <div className="flex items-center gap-4">
          <BookOpen className="size-3.5 text-white/70" strokeWidth={2} />
          <span className="text-[13px] font-medium text-white/70">BookFlow OS</span>
          <span className="text-[13px] text-white/50">File</span>
          <span className="text-[13px] text-white/50">Edit</span>
          <span className="text-[13px] text-white/50">View</span>
          <span className="text-[13px] text-white/50">Window</span>
          <span className="text-[13px] text-white/50">Help</span>
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
          <span className="flex items-center gap-1 text-[12px] text-white/50">
            <Shield className="size-3" />
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-6">
        {/* Clock */}
        <MacClock />

        {/* User Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4"
        >
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <User className="size-8 text-white/80" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* User Name */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-6"
        >
          <h1 className="text-[20px] font-semibold text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            BookFlow OS
          </h1>
          <p className="text-[13px] text-white/60 mt-0.5">
            Enterprise Business Platform
          </p>
        </motion.div>

        {/* Auth Card - Frosted Glass */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-6"
        >
          <AnimatePresence mode="wait">
            {/* ─── Serial Key Stage ─── */}
            {stage === 'serial-key' && (
              <motion.div
                key="serial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#FF9500]/20">
                    <Key className="size-4 text-[#FF9500]" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white/90">Activate Your Device</h2>
                    <p className="text-[12px] text-white/50">Enter your serial key to continue</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" strokeWidth={2} />
                    <Input
                      type="text"
                      placeholder="BF-XXX-2027-XXXX"
                      value={serialKey}
                      onChange={(e) => { setSerialKey(e.target.value.toUpperCase()); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleActivate)}
                      className="h-11 pl-9 pr-3 bg-white/[0.06] border-white/[0.1] text-white/90 placeholder:text-white/30 rounded-xl text-[14px] font-medium tracking-wide focus-visible:ring-[#007AFF]/40 focus-visible:border-[#007AFF]/40"
                      disabled={isActivating}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[#FF3B30] flex items-center gap-1"
                    >
                      <span className="size-1 rounded-full bg-[#FF3B30]" />
                      {error}
                    </motion.p>
                  )}

                  <Button
                    onClick={handleActivate}
                    disabled={isActivating || !serialKey.trim()}
                    className="w-full h-11 bg-[#007AFF] hover:bg-[#0071E3] text-white rounded-xl text-[14px] font-semibold tracking-tight shadow-[0_2px_8px_rgba(0,122,255,0.3)] transition-all"
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
                        <ArrowRight className="ml-1.5 size-4" strokeWidth={2} />
                      </>
                    )}
                  </Button>

                  {/* Separator */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-[11px] text-white/30 bg-transparent">or explore</span>
                    </div>
                  </div>

                  {/* Demo Login */}
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white/90 text-[14px] font-medium tracking-tight transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="size-4 text-[#AF52DE]" strokeWidth={2} />
                    Try Demo Account
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#AF52DE]/20 text-[#AF52DE]/80 font-semibold">VIEW ONLY</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Login Stage ─── */}
            {stage === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#007AFF]/20">
                    <Lock className="size-4 text-[#007AFF]" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white/90">Sign In</h2>
                    <p className="text-[12px] text-white/50">Enter your credentials to continue</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" strokeWidth={2} />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      className="h-11 pl-9 pr-3 bg-white/[0.06] border-white/[0.1] text-white/90 placeholder:text-white/30 rounded-xl text-[14px] font-medium focus-visible:ring-[#007AFF]/40 focus-visible:border-[#007AFF]/40"
                      disabled={isLoggingIn}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" strokeWidth={2} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                      className="h-11 pl-9 pr-10 bg-white/[0.06] border-white/[0.1] text-white/90 placeholder:text-white/30 rounded-xl text-[14px] font-medium focus-visible:ring-[#007AFF]/40 focus-visible:border-[#007AFF]/40"
                      disabled={isLoggingIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
                    </button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] text-[#FF3B30] flex items-center gap-1"
                    >
                      <span className="size-1 rounded-full bg-[#FF3B30]" />
                      {error}
                    </motion.p>
                  )}

                  <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn || !email.trim() || !password.trim()}
                    className="w-full h-11 bg-[#007AFF] hover:bg-[#0071E3] text-white rounded-xl text-[14px] font-semibold tracking-tight shadow-[0_2px_8px_rgba(0,122,255,0.3)] transition-all"
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
                        <ArrowRight className="ml-1.5 size-4" strokeWidth={2} />
                      </>
                    )}
                  </Button>

                  {/* Separator */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-[11px] text-white/30 bg-transparent">or</span>
                    </div>
                  </div>

                  {/* Demo Login */}
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white/90 text-[14px] font-medium tracking-tight transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="size-4 text-[#AF52DE]" strokeWidth={2} />
                    Try Demo Account
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#AF52DE]/20 text-[#AF52DE]/80 font-semibold">VIEW ONLY</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Initial Stage - Click to Start ─── */}
            {(stage === 'initial') && (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.button
                  onClick={() => setStage('serial-key')}
                  className="group flex flex-col items-center gap-3 mx-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-[72px] h-[72px] rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-white/[0.15] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <Lock className="size-6 text-white/60 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-white/80 group-hover:text-white/95 transition-colors">Click to Sign In</p>
                    <p className="text-[12px] text-white/40 mt-0.5">Set up your device to continue</p>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Monitor className="size-3 text-white/30" strokeWidth={2} />
            <span className="text-[12px] text-white/40">ApexFlow Ecosystem</span>
          </div>
          <p className="text-[11px] text-white/25">BookFlow OS v27.0 · Retina · {new Date().getFullYear()}</p>
        </motion.div>
      </div>

      {/* CSS Animation for stars */}
      <style jsx>{`
        @keyframes twinkle {
          from { opacity: 0.2; }
          to { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
