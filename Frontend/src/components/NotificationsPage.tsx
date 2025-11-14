import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CheckCheck,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NotificationsPageProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
}

// Start with an empty notifications list so users begin with a fresh state
const mockNotifications: any[] = [];

export function NotificationsPage({ user, navigate, logout }: NotificationsPageProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return Calendar;
      case 'reply': return MessageSquare;
      case 'announcement': return FileText;
      case 'mention': return MessageSquare;
      case 'reminder': return Bell;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-orange-500';
      case 'reply': return 'bg-blue-500';
      case 'announcement': return 'bg-purple-500';
      case 'mention': return 'bg-green-500';
      case 'reminder': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkAllRead = () => {
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    toast.success('All notifications cleared');
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1>Notifications</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear all
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          {mockNotifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                    !notification.read ? 'border-blue-300 bg-blue-50/50' : ''
                  }`}
                  onClick={() => navigate(notification.link)}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="mb-1">{notification.title}</h4>
                          <p className="text-gray-700">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 ml-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{notification.group}</Badge>
                        <span className="text-gray-500">• {notification.time}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3>Notification Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-gray-600">Receive notifications via email</p>
                </div>
                <Switch id="email-notif" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notif">Push Notifications</Label>
                  <p className="text-gray-600">Receive browser push notifications</p>
                </div>
                <Switch id="push-notif" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadline-24h">24 Hours Before Deadline</Label>
                  <p className="text-gray-600">Get notified 1 day before due date</p>
                </div>
                <Switch id="deadline-24h" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadline-3h">3 Hours Before Deadline</Label>
                  <p className="text-gray-600">Get notified 3 hours before due date</p>
                </div>
                <Switch id="deadline-3h" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadline-30m">30 Minutes Before Deadline</Label>
                  <p className="text-gray-600">Final reminder 30 minutes before</p>
                </div>
                <Switch id="deadline-30m" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mentions">Mentions & Replies</Label>
                  <p className="text-gray-600">When someone mentions or replies to you</p>
                </div>
                <Switch id="mentions" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="announcements">Group Announcements</Label>
                  <p className="text-gray-600">New posts and announcements in your groups</p>
                </div>
                <Switch id="announcements" defaultChecked />
              </div>
            </div>

            <Button className="w-full mt-6" onClick={() => toast.success('Preferences saved')}>
              Save Preferences
            </Button>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
