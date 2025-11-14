import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

const generateId = () => {
  try {
    // use secure UUID when available
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // fallback
  }
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
};

// sendInProgress is initialized inside the component with useRef
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  FileText,
  Paperclip,
  AlertCircle,
  ExternalLink,
  UserX,
  User as UserIcon,
  Loader2,
  Brain,
  Shield,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PersonalBotProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sources?: Array<{ group: string; post: string; link: string }>;
  confidence?: number;
  helpful?: boolean | null;
  notFound?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

const suggestedPrompts = [
  'Show me upcoming assignments',
  'What are the deadlines this week?',
  'How can I study effectively for exams?',
  'Show me study resources'
];

// start with no pre-seeded sources or groups so users begin with a clean slate
const mockSources: Array<{ group: string; post: string; link: string }> = [];
const mockGroups: Array<{ id: string; name: string; code: string; admins: string[] }> = [];

export function PersonalBot({ user, navigate, logout }: PersonalBotProps) {
  // Chat sessions (persisted to localStorage)
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [suggestedGroup, setSuggestedGroup] = useState<typeof mockGroups[0] | null>(null);

  const sendInProgress = useRef(false);

  // LocalStorage key (scoped per user so different accounts have separate chats)
  // include email as extra entropy to avoid accidental id collisions across test accounts
  const STORAGE_KEY = `personal_bot_chats_v1_${user?.id ?? 'anon'}_${(user?.email ?? '').replace(/@/g, '_')}`;

  // Initialize chats from localStorage for this user or create a default one
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        // Revive Date objects
        parsed.forEach(chat => chat.messages.forEach(m => { m.timestamp = new Date(m.timestamp); }));
        setChats(parsed);
        setCurrentChatId(parsed[0]?.id ?? null);
        return;
      }
      // Migration: if there is a legacy (unscoped) storage key, migrate it to the per-user key
      const LEGACY_KEY = 'personal_bot_chats_v1';
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        try {
          const parsedLegacy: ChatSession[] = JSON.parse(legacyRaw);
          parsedLegacy.forEach(chat => chat.messages.forEach(m => { m.timestamp = new Date(m.timestamp); }));
          setChats(parsedLegacy);
          setCurrentChatId(parsedLegacy[0]?.id ?? null);
          // persist under the new per-user key and remove legacy
          localStorage.setItem(STORAGE_KEY, legacyRaw);
          localStorage.removeItem(LEGACY_KEY);
          return;
        } catch (err) {
          console.warn('Failed to migrate legacy chats', err);
        }
      }
    } catch (e) {
      console.error('Failed to load chats from storage', e);
    }

    // Start with an empty chat session so users begin with a clean slate
    const defaultChat: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: []
    };

    setChats([defaultChat]);
    setCurrentChatId(defaultChat.id);
  }, [STORAGE_KEY]);

  // Persist chats when changed (scoped to the current user key)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error('Failed to save chats', e);
    }
  }, [chats, STORAGE_KEY]);

  const currentChat = chats.find(c => c.id === currentChatId) ?? chats[0] ?? null;
  const messages = currentChat?.messages ?? [];

  const saveChatMessages = (chatId: string, nextMessages: Message[]) => {
    setChats((prev: ChatSession[]) => prev.map((c: ChatSession) => c.id === chatId ? { ...c, messages: nextMessages } : c));
  };

  const focusInput = () => {
    const el = document.getElementById('personal-bot-input') as HTMLInputElement | null;
    el?.focus();
  };

  const resetChats = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
    const defaultChat: ChatSession = { id: generateId(), title: 'New Chat', messages: [] };
    setChats([defaultChat]);
    setCurrentChatId(defaultChat.id);
    toast.success('Chat history reset for this account');
    setTimeout(() => focusInput(), 120);
  };

  const SCROLL_AREA_ID = 'personal-bot-scroll-area';
  const scrollToBottom = () => {
    try {
      const root = document.getElementById(SCROLL_AREA_ID);
      const viewport = root?.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
      if (viewport) {
        // jump to bottom to keep input visible
        viewport.scrollTop = viewport.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    // prevent concurrent sends which previously left the UI in a blocked state
    if (isLoading || sendInProgress.current) {
      console.debug('send blocked: isLoading=', isLoading, 'sendInProgress=', sendInProgress.current);
      return;
    }
    // ensure there's an active chat; create one if not
    let chatId = currentChatId;
    if (!chatId) {
      const newChat: ChatSession = { id: generateId(), title: 'New Chat', messages: [] };
      setChats((prev: ChatSession[]) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      chatId = newChat.id;
      // focus the input for quick follow-up
      setTimeout(() => focusInput(), 120);
    }

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    const questionCopy = inputMessage;
    // append user message using functional update to avoid stale state
  console.debug('appending user message to chat', chatId, userMessage.id);
  setChats((prev: ChatSession[]) => prev.map((c: ChatSession) => c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c));
    setInputMessage('');
  // keep the view scrolled to bottom so the input remains visible
  setTimeout(() => scrollToBottom(), 50);
  // mark send in progress to prevent races
  sendInProgress.current = true;
  setIsLoading(true);
  setIsTyping(true);
  console.debug('send started: chatId=', chatId);

    try {
      // Simple rule-based replies for a fresh-start app:
      // - If the user says a greeting, reply with a friendly greeting.
      // - Otherwise, remind the user that group-specific answers require joining/creating a group.
      const text = questionCopy.trim();
      const lc = text.toLowerCase();
      const greetings = ['hi', 'hello', 'hey', 'hi there', 'hello there'];

      let responseText = '';
      if (greetings.some(g => lc === g || lc.startsWith(g + ' ') )) {
        const name = user?.name?.split(' ')[0] ?? '';
        responseText = `Hi ${name}! 👋 Nice to meet you — how can I help you today?`;
      } else if (lc === 'help') {
        responseText = 'I can help with general questions. To get group-specific answers, please create or join a group first.';
      } else {
        responseText = 'I don\'t have group-specific data yet. Create or join a group and I\'ll use its materials to answer. Meanwhile, ask me a general question or say "hi".';
      }

      // Typing effect (short)
      let currentText = '';
      for (let i = 0; i < responseText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 8));
        currentText += responseText[i];
        setTypingText(currentText);
      }

      const botMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: responseText,
        timestamp: new Date(),
        sources: [],
        confidence: undefined,
        helpful: null
      };
      console.debug('appending bot message to chat', chatId, botMessage.id);
      setChats((prev: ChatSession[]) => prev.map((c: ChatSession) => c.id === chatId ? { ...c, messages: [...c.messages, botMessage] } : c));
    } finally {
      console.debug('send finished: clearing flags for chat', chatId);
      setTypingText('');
      setIsTyping(false);
      setIsLoading(false);
      sendInProgress.current = false;
      // ensure input is visible and focused after the reply
      setTimeout(() => {
        scrollToBottom();
        focusInput();
      }, 120);
    }
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    if (!currentChatId) return;
    const next = messages.map((msg: Message) => msg.id === messageId ? { ...msg, helpful } : msg);
    saveChatMessages(currentChatId, next);
    toast.success(helpful ? '✨ Thanks for the feedback!' : 'We\'ll try to improve');
  };

  const sendToAdmins = (anonymous: boolean) => {
    const mode = anonymous ? 'anonymously' : 'with your name';
    toast.success(`✅ Question sent ${mode} to ${suggestedGroup?.name} admins!`, {
      description: `Admins will respond in the Admin Tickets section.`
    });
    setEscalateDialogOpen(false);
    setCurrentQuestion('');
    setSuggestedGroup(null);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [
        {
          id: generateId(),
          type: 'bot',
          content: 'Hi! I\'m your personal AI assistant. Ask me anything.',
          timestamp: new Date(),
        }
      ]
    };
    setChats((prev: ChatSession[]) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setTimeout(() => focusInput(), 120);
  };

  const deleteChat = (chatId: string) => {
    const confirmed = confirm('Delete this chat and its history? This cannot be undone.');
    if (!confirmed) return;
    setChats((prev: ChatSession[]) => {
      const remaining = prev.filter((c: ChatSession) => c.id !== chatId);
      // update currentChatId based on previous value to avoid stale closure
      setCurrentChatId((prevCurrent: string | null) => (prevCurrent === chatId ? (remaining[0]?.id ?? null) : prevCurrent));
      return remaining;
    });
  };

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/bot">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="flex flex-col min-h-0 overflow-hidden shadow-lg min-h-[60vh] max-h-[calc(100vh-14rem)]">
              {/* Header */}
              <motion.div 
                className="p-6 border-b bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Animated background particles */}
                <motion.div
                  className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-20 -z-10"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-32 h-32 bg-pink-200 rounded-full blur-3xl opacity-20 -z-10"
                  animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
                
                <div className="flex items-center gap-3 relative z-10">
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center relative shadow-lg"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 30px rgba(236, 72, 153, 0.6)',
                        '0 0 20px rgba(59, 130, 246, 0.4)',
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-2xl font-semibold mb-1">Personal AI Assistant</h3>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Brain className="w-4 h-4 text-purple-600" />
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-500">Private & Secure</p>
                      <Shield className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                  <motion.div 
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Identity Protected</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 min-h-0">
                <ScrollArea id={SCROLL_AREA_ID} className="flex-1 overflow-auto p-6">
                  <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, idx) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                          {message.type === 'bot' && (
                            <motion.div 
                              className="flex items-center gap-2 mb-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <span>AI Assistant</span>
                              {message.confidence !== undefined && message.confidence > 0 && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                  Confidence: {message.confidence}%
                                </Badge>
                              )}
                            </motion.div>
                          )}

                          <motion.div 
                            className={`rounded-2xl p-4 shadow-md ${
                              message.type === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-none'
                                : 'bg-gradient-to-br from-gray-50 to-gray-100 rounded-tl-none border border-gray-200'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <p className={`break-words whitespace-pre-wrap ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                              {message.content}
                            </p>
                          </motion.div>

                          {/* Sources */}
                          {message.sources && message.sources.length > 0 && (
                            <motion.div 
                              className="mt-3 space-y-2"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ delay: 0.2 }}
                            >
                              <p className="text-gray-500">📚 Sources from your groups:</p>
                              {message.sources.map((source, idx) => (
                                <motion.div 
                                  key={idx} 
                                  className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                >
                                  <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p>{source.group}</p>
                                    <p className="text-gray-600">{source.post}</p>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}

                          {/* Confidence Bar */}
                          {message.confidence && message.confidence > 0 && (
                            <motion.div 
                              className="mt-3"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Progress value={message.confidence} className="h-1.5" />
                            </motion.div>
                          )}

                          {/* Feedback */}
                          {message.type === 'bot' && message.confidence && message.confidence > 0 && (
                            <motion.div 
                              className="flex items-center gap-2 mt-3 flex-wrap"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <span className="text-gray-500">Was this helpful?</span>
                              <div className="flex gap-1">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant={message.helpful === true ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFeedback(message.id, true)}
                                    className={message.helpful === true ? 'bg-green-600 hover:bg-green-700' : ''}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant={message.helpful === false ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFeedback(message.id, false)}
                                    className={message.helpful === false ? 'bg-red-600 hover:bg-red-700' : ''}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}

                          <p className="text-xs text-gray-400 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%]">
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div 
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Bot className="w-4 h-4 text-white" />
                          </motion.div>
                          <span>AI Assistant</span>
                        </div>
                        <div className="rounded-2xl rounded-tl-none p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                          <p className="break-words whitespace-pre-wrap">{typingText}<motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >|</motion.span></p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {isLoading && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div 
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity }
                        }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </motion.div>
                      <div className="flex gap-1">
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-purple-500"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-pink-500"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 rounded-full bg-blue-500"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-gray-500">Searching in your groups...</span>
                    </motion.div>
                  )}
                </div>
                </ScrollArea>
              </div>

              {/* Input */}
              <motion.div 
                className="p-6 border-t bg-gray-50 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <Input
                    id="personal-bot-input"
                    placeholder="Ask me anything... (Your identity is protected)"
                    value={inputMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    className="flex-1 border-2 focus:border-purple-300"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleSendMessage} disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </motion.div>
                </div>

                <motion.div 
                  className="flex items-center gap-2 mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="text-green-700">🔒 Your identity is always protected when chatting with the bot</p>
                </motion.div>
              </motion.div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="p-4 shadow-lg border-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">💬 Chats</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={resetChats} title="Reset chats">
                      Reset
                    </Button>
                    <Button variant="ghost" size="icon" onClick={createNewChat}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => { setCurrentChatId(chat.id); setTimeout(() => focusInput(), 120); }}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${chat.id === currentChatId ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'} `}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <span className="line-clamp-1">{chat.title || 'Chat'}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); deleteChat(chat.id); }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 shadow-lg border-2">
                <h4 className="mb-4">⚡ Quick Actions</h4>
                <div className="space-y-2">
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" className="w-full justify-start gap-2 group border-2 hover:border-orange-300 hover:bg-orange-50">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Calendar className="w-4 h-4 text-orange-500" />
                      </motion.div>
                      <span className="group-hover:text-orange-600 transition-colors">Show Deadlines</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" className="w-full justify-start gap-2 group border-2 hover:border-blue-300 hover:bg-blue-50">
                      <FileText className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-blue-600 transition-colors">Show PDFs</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" className="w-full justify-start gap-2 group border-2 hover:border-purple-300 hover:bg-purple-50">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      </motion.div>
                      <span className="group-hover:text-purple-600 transition-colors">Show Assignments</span>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Suggested Prompts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 shadow-lg border-2">
                <h4 className="mb-4">💡 Suggested Questions</h4>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto py-3 px-3 text-left group hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-transparent hover:border-purple-200"
                        onClick={() => handleSuggestedPrompt(prompt)}
                      >
                        <motion.div
                          animate={{ rotate: [0, 180, 360] }}
                          transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                        >
                          <Sparkles className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" />
                        </motion.div>
                        <span className="line-clamp-2 group-hover:text-purple-700 transition-colors">{prompt}</span>
                      </Button>
                    </motion.div>
                  ))}</div>
              </Card>
            </motion.div>

            {/* Related Posts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 shadow-lg border-2">
                <h4 className="mb-4">📌 Related Group Posts</h4>
                <div className="space-y-3">
                  {mockSources.slice(0, 3).map((source, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, x: 5 }}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300"
                    >
                      <p className="mb-1">{source.post}</p>
                      <p className="text-gray-500">{source.group}</p>
                    </motion.div>
                  ))}</div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Escalate to Admin Dialog - NEW ANONYMOUS/NON-ANONYMOUS CHOICE */}
        <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Forward Question to Admin
              </DialogTitle>
              <DialogDescription>
                Your question couldn't be found in any group chats. Would you like to send it to the group admins?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {suggestedGroup && (
                <motion.div 
                  className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4>Detected Group</h4>
                  </div>
                  <p className="text-gray-700">{suggestedGroup.name} ({suggestedGroup.code})</p>
                  <p className="text-gray-500 mt-1">Admins: {suggestedGroup.admins.join(', ')}</p>
                </motion.div>
              )}

              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <p className="mb-2">Your Question:</p>
                <p className="text-gray-700 italic">"{currentQuestion}"</p>
              </div>

              <div className="space-y-3">
                <h4>Choose how to send:</h4>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => sendToAdmins(true)}
                    className="w-full h-auto py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <UserX className="w-5 h-5" />
                        <span>Send Anonymously</span>
                      </div>
                      <p className="text-white/90 text-sm">Admins won't see your name or identity</p>
                    </div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => sendToAdmins(false)}
                    variant="outline"
                    className="w-full h-auto py-4 border-2 border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        <span>Send with Your Name</span>
                      </div>
                      <p className="text-gray-500 text-sm">Admins will see who asked the question</p>
                    </div>
                  </Button>
                </motion.div>
              </div>

              <motion.div 
                className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-yellow-700 text-sm">Admins will respond in the Admin Tickets section</p>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
