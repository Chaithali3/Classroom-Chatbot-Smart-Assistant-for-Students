import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Bot, 
  Bell, 
  User, 
  Menu, 
  Search, 
  LogOut,
  Settings,
  FileText,
  Ticket
} from 'lucide-react';
import { User as UserType } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
  user: UserType;
  navigate: (route: string) => void;
  logout: () => void;
  currentRoute?: string;
}

export function AppLayout({ children, user, navigate, logout, currentRoute = '/dashboard' }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  // Start with zero notifications so users begin with a fresh state
  const [notificationCount] = useState(0);

  // Check persisted groups to see if the current user created/admin any group
  let userIsGroupAdmin = false;
  try {
    const raw = localStorage.getItem(`groups_v1_${user.id}`);
    if (raw) {
      const parsed = JSON.parse(raw) as Array<any>;
      userIsGroupAdmin = parsed.some(g => g && (g.createdBy === user.id || g.isAdmin === true && g.createdBy === user.id));
    }
  } catch (err) {
    userIsGroupAdmin = false;
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
    { icon: Users, label: 'Groups', route: '/groups' },
    { icon: Bot, label: 'Personal Bot', route: '/bot' },
    { icon: Bell, label: 'Notifications', route: '/notifications', badge: notificationCount },
    ...((user.role === 'Faculty' || user.role === 'CR' || (user as any).isSiteAdmin || userIsGroupAdmin) ? [{ icon: Ticket, label: 'Admin Tickets', route: '/admin/tickets' }] : []),
    { icon: FileText, label: 'Docs', route: '/docs' },
    { icon: User, label: 'Profile', route: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r flex-col z-40"
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl">ClassBot</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <motion.div
              key={item.route}
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={currentRoute === item.route ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 group"
                onClick={() => navigate(item.route)}
              >
                <motion.div
                  animate={currentRoute === item.route ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon className={`w-5 h-5 ${currentRoute === item.route ? 'text-blue-600' : ''} group-hover:scale-110 transition-transform`} />
                </motion.div>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Badge variant="destructive" className="rounded-full px-2">
                      {item.badge}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setLogoutConfirmOpen(true)}>
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white flex-col z-50"
            >
              <div className="p-6 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl">ClassBot</span>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Button
                    key={item.route}
                    variant={currentRoute === item.route ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      navigate(item.route);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="rounded-full px-2">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}
              </nav>

              <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setLogoutConfirmOpen(true)}>
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search groups, posts, or ask a question..."
                  className="pl-9"
                />
              </div>
            </div>

            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/notifications')}>
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  {notificationCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLogoutConfirmOpen(true)}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        {/*
          Add extra bottom padding on small screens so the fixed mobile
          bottom navigation doesn't overlap content. On larger screens the
          left sidebar provides spacing so a smaller bottom padding is used.
        */}
        <main className="p-4 md:p-6 pb-16 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {/* Logout confirmation dialog */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout? You will need to sign in again to continue.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setLogoutConfirmOpen(false); logout(); }}>Logout</Button>
          </div>
        </DialogContent>
      </Dialog>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { icon: LayoutDashboard, route: '/dashboard' },
            { icon: Users, route: '/groups' },
            { icon: Bot, route: '/bot' },
            { icon: Bell, route: '/notifications', badge: notificationCount },
            { icon: User, route: '/profile' },
          ].map((item) => (
            <Button
              key={item.route}
              variant={currentRoute === item.route ? 'secondary' : 'ghost'}
              size="icon"
              className="relative h-12 w-full"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
