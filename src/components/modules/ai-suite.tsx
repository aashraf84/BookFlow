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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

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

function AIChatPanel({ config }: { config: AITabConfig }) {
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: config.welcomeMessage,
      timestamp: new Date(),
    }])
  }, [config])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: json.data?.response || 'I apologize, but I was unable to generate a response. Please try again.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
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
      {/* Context Panel */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl macos-shadow p-4 bg-card h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-macos-blue/10 p-1.5">
              <Icon className="size-4 text-macos-blue" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold tracking-tight">Context Data</h3>
              <p className="text-[11px] text-muted-foreground">Current business metrics</p>
            </div>
          </div>

          <div className="space-y-2">
            {config.contextData.map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <ItemIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold tracking-tight">{item.value}</span>
                </div>
              )
            })}
          </div>

          <Separator className="my-3" />

          <div>
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2 flex items-center gap-1">
              <Lightbulb className="size-3" />
              Quick Suggestions
            </p>
            <div className="space-y-1.5">
              {config.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-secondary/30 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col">
        <div className="rounded-2xl macos-shadow bg-card flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-macos-purple/10 p-1.5">
                <Brain className="size-4 text-macos-purple" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-tight">{config.label}</h3>
                <p className="text-[11px] text-muted-foreground">AI-powered insights and recommendations</p>
              </div>
            </div>
            <Badge className="bg-macos-purple/10 text-macos-purple rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5">
              <Sparkles className="size-3 mr-1" />
              AI
            </Badge>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 rounded-lg bg-macos-purple/10 p-1.5 h-fit mt-1">
                    <Bot className="size-4 text-macos-purple" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-2xl'
                      : 'bg-secondary rounded-2xl'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 rounded-lg bg-primary/10 p-1.5 h-fit mt-1">
                    <User className="size-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 rounded-lg bg-macos-purple/10 p-1.5 h-fit mt-1">
                  <Bot className="size-4 text-macos-purple" />
                </div>
                <div className="max-w-[80%] p-3 bg-secondary rounded-2xl">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${config.label.toLowerCase()}...`}
                className="flex-1 rounded-xl bg-secondary/80 border-0 text-[13px] h-9 px-4 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-primary-foreground rounded-lg h-9 w-9 p-0"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AiSuiteModule() {
  const [activeTab, setActiveTab] = React.useState('forecast')

  const activeConfig = aiTabs.find((t) => t.id === activeTab) || aiTabs[0]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Suite</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">AI-powered business intelligence and automated workflows</p>
        </div>
        <Badge className="bg-macos-purple/10 text-macos-purple rounded-md text-[10px] font-semibold tracking-wide px-2 py-0.5">
          <Sparkles className="size-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Segmented Tabs */}
      <div className="macos-segmented inline-flex p-0.5 flex-wrap gap-0.5">
        {aiTabs.map((tab) => {
          const TabIcon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${
                isActive ? 'macos-segmented-active' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TabIcon className="size-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Chat Panel */}
      <AIChatPanel config={activeConfig} />
    </div>
  )
}
