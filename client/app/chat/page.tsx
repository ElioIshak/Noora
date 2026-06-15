'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  authAPI,
  chatAPI,
  clearAuthToken,
  isAuthenticated,
  userAPI,
  type Message,
  type Conversation,
  type User as AppUser,
} from '@/lib/api'
import {
  Search,
  Plus,
  Settings,
  LogOut,
  Send,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Brain,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDeleteConversation,
  onLogout,
  isLoading,
  isDeletingConversationId,
  user,
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  onLogout: () => void
  isLoading: boolean
  isDeletingConversationId: string | null
  user: AppUser | null
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const userName = user?.name || 'User'
  const userEmail = user?.email || 'No email'

  return (
    <aside className="w-80 h-full border-r border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 mb-5 group">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <span className="text-sidebar-primary-foreground font-serif text-sm font-semibold">N</span>
          </div>
          <span className="font-serif text-lg font-semibold text-sidebar-foreground tracking-tight">Noora</span>
        </Link>

        <Button
          onClick={onNewChat}
          className="w-full rounded-xl justify-start gap-2.5 h-11 shadow-sm"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9 h-10 rounded-xl bg-sidebar-accent/50 border-sidebar-border"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 rounded-xl">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 group ${
                  activeId === conversation.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm truncate flex-1">{conversation.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background/50 rounded transition-all"
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Conversation options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          onDeleteConversation(conversation.id)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        {isDeletingConversationId === conversation.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">{conversation.preview}</p>
                <p className="text-xs text-muted-foreground/60 mt-1.5">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">{userName[0]?.toUpperCase() ?? 'U'}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                onLogout()
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

function MessageBubble({
  message,
  userInitial,
  isTyping = false,
}: {
  message: Message
  userInitial: string
  isTyping?: boolean
}) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-up`}
      style={{ animationFillMode: 'both' }}
    >
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
          isUser ? 'bg-primary/15' : 'bg-noora-sky/40'
        }`}
      >
        {isUser ? (
          <span className="text-sm font-medium text-primary">{userInitial}</span>
        ) : (
          <Brain className="w-4 h-4 text-primary" />
        )}
      </div>

      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-5 py-3.5 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-card border border-border rounded-tl-md'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1.5 py-1">
              <div
                className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {!isTyping && message.emotionTags && message.emotionTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {message.emotionTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {!isTyping && (
          <p className={`text-xs text-muted-foreground mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

function MessageComposer({
  onSend,
  isLoading,
}: {
  onSend: (message: string) => void
  isLoading: boolean
}) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/60 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-background rounded-2xl border border-border p-2.5 shadow-sm">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-sm leading-relaxed px-2.5 py-2 max-h-[150px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl h-10 w-10 flex-shrink-0 shadow-sm"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Noora is an AI companion. For crisis support, please contact a professional.
        </p>
      </div>
    </form>
  )
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-noora-sky/40 mx-auto mb-7 flex items-center justify-center shadow-lg shadow-primary/10">
          <Brain className="w-9 h-9 text-primary" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">Welcome to Noora</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          I&apos;m here to listen and support you. Start a conversation whenever you&apos;re ready - there&apos;s no
          pressure, and no topic is too small or too big.
        </p>
        <Button onClick={onNewChat} className="rounded-full px-7 py-5 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Start a Conversation
        </Button>
      </div>
    </div>
  )
}

function MessagesLoading() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className={`flex gap-3 ${item % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className={`space-y-2 ${item % 2 === 0 ? 'items-end' : ''}`}>
            <Skeleton className={`h-16 ${item % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<AppUser | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isDeletingConversationId, setIsDeletingConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadRequestIdRef = useRef(0)
  const deletedConversationIdsRef = useRef(new Set<string>())

  const handleAuthFailure = useCallback(() => {
    clearAuthToken()
    router.replace('/auth/login')
  }, [router])

  const handleRequestError = useCallback(
    (requestError: unknown, fallbackMessage: string): string => {
      const message = requestError instanceof Error ? requestError.message : fallbackMessage

      if (message.toLowerCase().includes('not authenticated')) {
        handleAuthFailure()
      }

      return message
    },
    [handleAuthFailure]
  )

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const requestId = loadRequestIdRef.current + 1
      loadRequestIdRef.current = requestId

      setIsLoadingMessages(true)
      setError('')

      try {
        const result = await chatAPI.getConversation(conversationId)
        if (requestId !== loadRequestIdRef.current || deletedConversationIdsRef.current.has(conversationId)) {
          return
        }

        setMessages(result.messages)

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  ...result.conversation,
                  messageCount: result.messages.length,
                }
              : conversation
          )
        )
      } catch (requestError) {
        if (requestId !== loadRequestIdRef.current || deletedConversationIdsRef.current.has(conversationId)) {
          return
        }

        setError(handleRequestError(requestError, 'Failed to load conversation.'))
      } finally {
        if (requestId === loadRequestIdRef.current) {
          setIsLoadingMessages(false)
        }
      }
    },
    [handleRequestError]
  )

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    async function bootstrap() {
      if (!isAuthenticated()) {
        setIsLoadingConversations(false)
        router.replace('/auth/login')
        return
      }

      setIsLoadingConversations(true)
      setError('')

      try {
        const [profile, loadedConversations] = await Promise.all([userAPI.getProfile(), chatAPI.getConversations()])

        setUser(profile)
        setConversations(loadedConversations)

        if (loadedConversations.length > 0) {
          const firstConversationId = loadedConversations[0].id
          setActiveConversationId(firstConversationId)
          await loadConversation(firstConversationId)
        }
      } catch (requestError) {
        setError(handleRequestError(requestError, 'Failed to initialize chat.'))
      } finally {
        setIsLoadingConversations(false)
      }
    }

    void bootstrap()
  }, [handleRequestError, loadConversation, router])

  const handleSelectConversation = async (conversationId: string) => {
    if (isDeletingConversationId || deletedConversationIdsRef.current.has(conversationId)) {
      return
    }

    setActiveConversationId(conversationId)
    await loadConversation(conversationId)
  }

  const handleNewChat = async () => {
    setIsCreatingConversation(true)
    setError('')

    try {
      const newConversation = await chatAPI.createConversation()
      setConversations((previous) => [newConversation, ...previous])
      setActiveConversationId(newConversation.id)
      setMessages([])
    } catch (requestError) {
      setError(handleRequestError(requestError, 'Failed to create a new conversation.'))
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (isDeletingConversationId) {
      return
    }

    setIsDeletingConversationId(conversationId)
    deletedConversationIdsRef.current.add(conversationId)
    setError('')

    try {
      await chatAPI.deleteConversation(conversationId)
      const remaining = conversations.filter((conversation) => conversation.id !== conversationId)
      setConversations(remaining)

      if (activeConversationId === conversationId) {
        const nextConversationId = remaining[0]?.id ?? null
        setActiveConversationId(nextConversationId)

        if (nextConversationId) {
          await loadConversation(nextConversationId)
        } else {
          setMessages([])
        }
      }
    } catch (requestError) {
      deletedConversationIdsRef.current.delete(conversationId)
      setError(handleRequestError(requestError, 'Failed to delete conversation.'))
    } finally {
      setIsDeletingConversationId(null)
    }
  }

  const handleSendMessage = async (content: string) => {
    let targetConversationId = activeConversationId

    if (!targetConversationId) {
      setIsCreatingConversation(true)

      try {
        const createdConversation = await chatAPI.createConversation()
        setConversations((previous) => [createdConversation, ...previous])
        setActiveConversationId(createdConversation.id)
        targetConversationId = createdConversation.id
      } catch (requestError) {
        setError(handleRequestError(requestError, 'Failed to create conversation.'))
        setIsCreatingConversation(false)
        return
      }

      setIsCreatingConversation(false)
    }

    if (!targetConversationId) {
      return
    }

    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: targetConversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    setMessages((previous) => [...previous, optimisticUserMessage])
    setIsSending(true)
    setIsTyping(true)
    setError('')

    try {
      const turn = await chatAPI.sendMessage(targetConversationId, content)

      const updatedConversation: Conversation = {
        ...turn.conversation,
        preview: content.length > 80 ? `${content.slice(0, 77)}...` : content,
        updatedAt: new Date().toISOString(),
        messageCount: turn.messages.length,
      }

      setMessages(turn.messages)
      setConversations((previous) => {
        const withoutUpdated = previous.filter((conversation) => conversation.id !== updatedConversation.id)
        return [updatedConversation, ...withoutUpdated]
      })
      setActiveConversationId(updatedConversation.id)
    } catch (requestError) {
      setMessages((previous) => previous.filter((message) => message.id !== optimisticUserMessage.id))
      setError(handleRequestError(requestError, 'Failed to send your message.'))
    } finally {
      setIsTyping(false)
      setIsSending(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // Logout should still clear local auth state even if API call fails.
    } finally {
      clearAuthToken()
      router.push('/')
    }
  }

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)
  const userInitial = (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <div className="chat-neutral-theme h-screen flex bg-background">
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={(conversationId) => {
            void handleSelectConversation(conversationId)
            if (window.innerWidth < 1024) {
              setSidebarOpen(false)
            }
          }}
          onNewChat={() => {
            void handleNewChat()
            if (window.innerWidth < 1024) {
              setSidebarOpen(false)
            }
          }}
          onDeleteConversation={(conversationId) => {
            void handleDeleteConversation(conversationId)
          }}
          onLogout={handleLogout}
          isLoading={isLoadingConversations}
          isDeletingConversationId={isDeletingConversationId}
          user={user}
        />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {error && (
          <div className="px-4 lg:px-6 pt-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm px-4 py-3">
              {error}
            </div>
          </div>
        )}

        {activeConversationId ? (
          <>
            <header className="h-16 border-b border-border px-4 lg:px-6 flex items-center justify-between bg-card/60 backdrop-blur-sm">
              <div className="flex items-center gap-3.5 pl-12 lg:pl-0">
                <div className="w-9 h-9 rounded-full bg-noora-sky/40 flex items-center justify-center shadow-sm">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                    {activeConversation?.title || 'Conversation'}
                  </h1>
                  <p className="text-xs text-muted-foreground">{messages.length} messages</p>
                </div>
              </div>
            </header>

            {isLoadingMessages ? (
              <MessagesLoading />
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <p className="text-muted-foreground">Start the conversation by sharing what&apos;s on your mind.</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
                <div className="max-w-3xl mx-auto space-y-5">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} userInitial={userInitial} />
                  ))}
                  {isTyping && (
                    <MessageBubble
                      message={{
                        id: 'typing',
                        conversationId: activeConversationId,
                        role: 'assistant',
                        content: '',
                        createdAt: new Date().toISOString(),
                      }}
                      userInitial={userInitial}
                      isTyping
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            <MessageComposer onSend={(message) => void handleSendMessage(message)} isLoading={isSending || isCreatingConversation} />
          </>
        ) : (
          <EmptyState onNewChat={() => void handleNewChat()} />
        )}
      </main>
    </div>
  )
}
