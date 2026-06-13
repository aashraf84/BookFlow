'use client'

import * as React from 'react'
import {
  Brain,
  TrendingUp,
  Package,
  GraduationCap,
  Megaphone,
  Briefcase,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  BarChart3,
  BookOpen,
  ShoppingCart,
  DollarSign,
  Lightbulb,
  Eye,
  Zap,
  MessageSquare,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/app-store'
import {
  MacosPageHeader,
  MacosCard,
  MacosBadge,
  MacosButton,
  MacosSection,
} from '@/components/macos-ui'

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AITabConfig {
  id: string
  label: string
  icon: React.ElementType
  type: 'forecast' | 'assistant' | 'academic' | 'marketing' | 'business'
  color: string
  colorBg: string
  avatarEmoji: string
  suggestions: string[]
  contextData: { label: string; value: string; icon: React.ElementType }[]
  welcomeMessage: string
}

const aiTabs: AITabConfig[] = [
  {
    id: 'forecast',
    label: 'Sales Forecast',
    icon: TrendingUp,
    type: 'forecast',
    color: 'text-macos-blue',
    colorBg: 'bg-macos-blue/10',
    avatarEmoji: '📈',
    suggestions: [
      "What will next month's revenue be?",
      'Which books are trending?',
      'Predict holiday season sales',
      'Which product categories are growing?',
    ],
    contextData: [
      { label: 'Monthly Revenue', value: '$68,200', icon: DollarSign },
      { label: 'Growth Rate', value: '+12.5%', icon: TrendingUp },
      { label: 'Active Products', value: '1,240', icon: BookOpen },
      { label: 'Avg Order Value', value: '$135', icon: ShoppingCart },
    ],
    welcomeMessage: 'I can help you forecast sales, identify trends, and predict future revenue. Ask me about expected sales, trending products, or seasonal patterns.',
  },
  {
    id: 'inventory',
    label: 'Inventory AI',
    icon: Package,
    type: 'assistant',
    color: 'text-macos-green',
    colorBg: 'bg-macos-green/10',
    avatarEmoji: '📦',
    suggestions: [
      'What should I reorder?',
      'Which items are slow-moving?',
      'Predict stock-out risk',
      'Optimize inventory levels',
    ],
    contextData: [
      { label: 'Total SKUs', value: '4,238', icon: Package },
      { label: 'Low Stock', value: '120 items', icon: BarChart3 },
      { label: 'Out of Stock', value: '45 items', icon: Package },
      { label: 'Dead Stock', value: '23 items', icon: BarChart3 },
    ],
    welcomeMessage: 'I can help optimize your inventory, identify reorder needs, and analyze stock movement patterns. Ask me about stock levels, reorder points, or slow-moving items.',
  },
  {
    id: 'academic',
    label: 'Academic Planning',
    icon: GraduationCap,
    type: 'academic',
    color: 'text-macos-purple',
    colorBg: 'bg-macos-purple/10',
    avatarEmoji: '🎓',
    suggestions: [
      'Create a Grade 5 book package',
      'What supplies do schools need?',
      'Plan back-to-school inventory',
      'Compare academic package pricing',
    ],
    contextData: [
      { label: 'Schools', value: '18 active', icon: GraduationCap },
      { label: 'Contracts', value: '14 active', icon: Briefcase },
      { label: 'Academic Books', value: '890 titles', icon: BookOpen },
      { label: 'Packages', value: '45 defined', icon: Package },
    ],
    welcomeMessage: 'I can help with academic package planning, textbook selection, and school supply lists. Ask me to create book packages for specific grades or plan school supply orders.',
  },
  {
    id: 'marketing',
    label: 'Marketing AI',
    icon: Megaphone,
    type: 'marketing',
    color: 'text-macos-orange',
    colorBg: 'bg-macos-orange/10',
    avatarEmoji: '📣',
    suggestions: [
      'Generate a WhatsApp campaign for new arrivals',
      'Create email for back-to-school sale',
      'Suggest loyalty program improvements',
      'Plan a book launch event',
    ],
    contextData: [
      { label: 'Active Campaigns', value: '5', icon: Megaphone },
      { label: 'Loyalty Members', value: '2,340', icon: Sparkles },
      { label: 'Email Open Rate', value: '24.8%', icon: BarChart3 },
      { label: 'Conversion Rate', value: '3.2%', icon: TrendingUp },
    ],
    welcomeMessage: 'I can help create marketing campaigns, promotional strategies, and customer engagement plans. Ask me to generate campaign content, WhatsApp messages, or email templates.',
  },
  {
    id: 'business',
    label: 'Business Assistant',
    icon: Briefcase,
    type: 'business',
    color: 'text-gg-bridge',
    colorBg: 'bg-gg-bridge/10',
    avatarEmoji: '💼',
    suggestions: [
      'Give me a revenue summary',
      'What are our profit margins?',
      'Analyze branch performance',
      'Suggest cost reduction strategies',
    ],
    contextData: [
      { label: 'Total Revenue', value: '$682K', icon: DollarSign },
      { label: 'Profit Margin', value: '30.2%', icon: TrendingUp },
      { label: 'Branches', value: '5 active', icon: Briefcase },
      { label: 'Employees', value: '48 staff', icon: Sparkles },
    ],
    welcomeMessage: 'I can help with financial analysis, profitability insights, and business strategy. Ask me about revenue summaries, profit margins, or operational efficiency improvements.',
  },
]

// ─── AI Chat Panel (iMessage-style with frosted glass) ───

function AIChatPanel({ config, isDemo }: { config: AITabConfig; isDemo: boolean }) {
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [typingText, setTypingText] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: config.welcomeMessage,
      timestamp: new Date(),
    }])
    setTypingText('')
    setIsTyping(false)
  }, [config])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typingText])

  // Typing animation effect
  const animateTyping = React.useCallback((text: string) => {
    setIsTyping(true)
    setTypingText('')
    let i = 0
    const typeChar = () => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1))
        i++
        typingTimerRef.current = setTimeout(typeChar, 12 + Math.random() * 18)
      } else {
        setIsTyping(false)
        setTypingText('')
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: text,
          timestamp: new Date(),
        }])
      }
    }
    typeChar()
  }, [])

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: config.type, query: query.trim() }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')

      const json = await res.json()
      const responseText = json.data?.response || 'I apologize, but I was unable to generate a response. Please try again.'

      // Start typing animation
      animateTyping(responseText)
    } catch {
      toast({ title: 'Error', description: 'Failed to get AI response', variant: 'destructive' })
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const Icon = config.icon

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)] min-h-[500px]">
      {/* Sidebar: Context + Suggestions */}
      <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
        {/* Context Data Card */}
        <div className="macos-card macos-shadow-card p-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className={`rounded-lg ${config.colorBg} p-1.5`}>
              <Icon className={`size-4 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">Context Data</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Live metrics</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {config.contextData.map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40">
                  <div className="flex items-center gap-2">
                    <ItemIcon className="size-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold tracking-tight tabular-nums">{item.value}</span>
                </div>
              )
            })}
          </div>

          <div className="my-3 h-px bg-border" />

          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 flex items-center gap-1">
              <Lightbulb className="size-3" />
              Quick Suggestions
            </p>
            <div className="space-y-1">
              {config.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-colors font-medium leading-snug"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* iMessage-style Chat Area with frosted glass */}
      <div className="lg:col-span-3 flex flex-col">
        <div className="macos-card macos-shadow-card flex-1 flex flex-col overflow-hidden">
          {/* Chat Header - macOS Titlebar style */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              {/* Colored Avatar */}
              <div className={`relative rounded-full ${config.colorBg} p-2`}>
                <span className="text-base leading-none">{config.avatarEmoji}</span>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight">{config.label}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="size-1.5 rounded-full bg-macos-green" />
                  <p className="text-[11px] text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDemo && (
                <MacosBadge variant="warning">
                  <Eye className="size-3 mr-1" />
                  DEMO
                </MacosBadge>
              )}
              <MacosBadge variant="purple">
                <Sparkles className="size-3 mr-1" />
                AI
              </MacosBadge>
            </div>
          </div>

          {/* Messages Area - iMessage bubble style with frosted glass */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {msg.role === 'assistant' ? (
                    <div className={`shrink-0 rounded-full ${config.colorBg} p-1.5 size-7 flex items-center justify-center`}>
                      <span className="text-xs leading-none">{config.avatarEmoji}</span>
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full bg-macos-blue/10 p-1 size-7 flex items-center justify-center">
                      <User className="size-3.5 text-macos-blue" />
                    </div>
                  )}
                  {/* Bubble - frosted glass for assistant */}
                  <div
                    className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-macos-blue text-white rounded-2xl rounded-br-md shadow-sm'
                        : 'glass-card bg-secondary/80 rounded-2xl rounded-bl-md shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <p className={`text-[10px] mt-1 ${
                      msg.role === 'user' ? 'text-white/50' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing animation bubble */}
            {(isLoading || isTyping) && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className={`shrink-0 rounded-full ${config.colorBg} p-1.5 size-7 flex items-center justify-center`}>
                    <span className="text-xs leading-none">{config.avatarEmoji}</span>
                  </div>
                  <div className="px-3.5 py-2.5 glass-card bg-secondary/80 rounded-2xl rounded-bl-md shadow-sm">
                    {isTyping ? (
                      <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{typingText}<span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-text-bottom" /></div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[12px] text-muted-foreground ml-1">Thinking...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile suggestions */}
          <div className="lg:hidden px-4 py-2 border-t border-border/30">
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {config.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="shrink-0 text-[11px] px-3 py-1 rounded-full bg-secondary/80 hover:bg-primary/10 hover:text-primary transition-colors font-medium whitespace-nowrap"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* iMessage-style Input Bar - macOS pill shape */}
          <div className="border-t border-border/50 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message ${config.label}...`}
                  className="w-full rounded-full bg-secondary/80 border border-border/50 text-[13px] h-10 px-4 pr-10 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <MacosButton
                variant="primary"
                icon={isLoading ? Loader2 : Send}
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className={`rounded-full bg-macos-blue text-white hover:bg-macos-blue/90 h-10 w-10 p-0 shadow-sm disabled:opacity-40 ${isLoading ? 'animate-spin' : ''}`}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main AI Suite Component ───

export function AiSuiteModule() {
  const { authUser } = useAppStore()
  const isViewOnly = authUser?.isViewOnly ?? false
  const [activeTab, setActiveTab] = React.useState('forecast')

  const activeConfig = aiTabs.find((t) => t.id === activeTab) || aiTabs[0]

  return (
    <div className="space-y-4">
      {/* macOS Page Header */}
      <MacosPageHeader
        title="AI Suite"
        subtitle="AI-powered business intelligence and automated workflows"
        icon={Brain}
        iconColor="text-macos-purple"
        iconBg="bg-macos-purple/10"
      >
        {isViewOnly && (
          <MacosBadge variant="warning">
            <Eye className="size-3 mr-1" />
            DEMO MODE
          </MacosBadge>
        )}
        <MacosBadge variant="purple">
          <Zap className="size-3 mr-1" />
          AI POWERED
        </MacosBadge>
      </MacosPageHeader>

      {/* AI Assistant Tabs - macOS Filter Bar style */}
      <div className="macos-filter-bar">
        {aiTabs.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 ${
                isActive ? 'macos-filter-item macos-filter-item-active' : 'macos-filter-item'
              }`}
            >
              <TabIcon className="size-3.5" />
              <span className="text-[12px]">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Chat Panel */}
      <AIChatPanel config={activeConfig} isDemo={isViewOnly} />
    </div>
  )
}
