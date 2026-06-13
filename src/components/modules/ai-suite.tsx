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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    label: 'Inventory Intelligence',
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

  // Add welcome message on first render
  React.useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: config.welcomeMessage,
      timestamp: new Date(),
    }])
  }, [config])

  // Auto-scroll to bottom
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
      <div className="lg:col-span-1 space-y-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950/30">
                <Icon className="size-4 text-emerald-600" />
              </div>
              <CardTitle className="text-sm">Context Data</CardTitle>
            </div>
            <CardDescription className="text-xs">Current business metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.contextData.map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <ItemIcon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              )
            })}

            <Separator className="my-3" />

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="size-3" />
                Quick Suggestions
              </p>
              <div className="space-y-1.5">
                {config.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestion(suggestion)}
                    className="w-full text-left text-xs p-2 rounded-md bg-muted/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950/30">
                  <Brain className="size-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-sm">{config.label}</CardTitle>
                  <CardDescription className="text-xs">AI-powered insights and recommendations</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Sparkles className="size-3" />
                AI Powered
              </Badge>
            </div>
          </CardHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950/30 h-fit mt-1">
                    <Bot className="size-4 text-emerald-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-emerald-200' : 'text-muted-foreground'}`}>
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
                <div className="shrink-0 rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-950/30 h-fit mt-1">
                  <Bot className="size-4 text-emerald-600" />
                </div>
                <div className="max-w-[80%] rounded-lg p-3 bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${config.label.toLowerCase()}...`}
                className="flex-1 h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 h-9"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </Card>
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
      <div>
        <h2 className="text-lg font-semibold">AI Suite</h2>
        <p className="text-sm text-muted-foreground">AI-powered business intelligence and automated workflows</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {aiTabs.map((tab) => {
            const TabIcon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-950/30 dark:data-[state=active]:text-emerald-400 gap-1.5 text-xs px-3 py-1.5"
              >
                <TabIcon className="size-3.5" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {aiTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            <AIChatPanel config={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
