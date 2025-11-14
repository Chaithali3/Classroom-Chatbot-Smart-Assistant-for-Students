import { useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ConfettiCelebration } from './ConfettiCelebration';
import { AchievementToast } from './AchievementToast';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Flame,
  Zap,
  Trophy
} from 'lucide-react';

interface DashboardProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
}

// Start with empty arrays so dashboard features are present but start from zero
const initialDeadlines: any[] = [];
const initialAnnouncements: any[] = [];

export function Dashboard({ user, navigate, logout }: DashboardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievement, setAchievement] = useState<any>(null);

  // Runtime state: start empty so everything begins at zero
  const [deadlines] = useState<any[]>(initialDeadlines);
  const [announcements] = useState<any[]>(initialAnnouncements);
  const [activeGroups] = useState<any[]>([]);
  const [unreadMessages] = useState<number>(0);
  const [streakDays] = useState<number>(0);
  
  const celebrateStreak = () => {
    setShowConfetti(true);
    setAchievement({
      id: '1',
      title: 'Week Warrior!',
      description: 'You\'ve maintained a 7-day streak!',
      icon: 'trophy',
      show: true
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Due soon';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Assignment': return 'bg-blue-500';
      case 'Event': return 'bg-purple-500';
      case 'Notice': return 'bg-orange-500';
      case 'Resource': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/dashboard">
      <ConfettiCelebration trigger={showConfetti} message="Amazing Streak!" />
      <AchievementToast 
        achievement={achievement} 
        onClose={() => setAchievement(null)} 
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.h1 
                className="mb-2"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                Welcome back, {user.name.split(' ')[0]}! 
                <motion.span
                  animate={{ rotate: [0, 20, -20, 20, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  className="inline-block ml-2"
                >
                  👋
                </motion.span>
              </motion.h1>
              <p className="text-gray-600">Here's what's happening with your classes today</p>
            </div>
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={() => navigate('/bot')} className="gap-2 relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Sparkles className="w-4 h-4" />
                  Ask Bot
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" onClick={() => navigate('/groups')}>
                  View Groups
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Groups', value: `${activeGroups.length}`, icon: Users, color: 'bg-blue-500', change: '' },
            { label: 'Upcoming Deadlines', value: `${deadlines.length}`, icon: Calendar, color: 'bg-orange-500', change: '' },
            { label: 'Unread Messages', value: `${unreadMessages}`, icon: MessageSquare, color: 'bg-purple-500', change: '' },
            { label: 'Study Streak', value: `${streakDays} days`, icon: Flame, color: 'bg-gradient-to-r from-orange-500 to-red-500', change: '', special: true },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={stat.special ? celebrateStreak : undefined}
              className={stat.special ? 'cursor-pointer' : ''}
            >
              <Card className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <motion.h2 
                        className="mb-0"
                        animate={stat.special ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.value}
                      </motion.h2>
                      {stat.change && (
                        <motion.span 
                          className="text-green-600"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {stat.change}
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center relative`}
                    animate={stat.special ? { 
                      rotate: [0, 5, -5, 5, 0],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                    {stat.special && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-yellow-400"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3>Upcoming Deadlines</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="space-y-4">
                {deadlines.map((deadline, index) => (
                  <motion.div
                    key={deadline.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <div className={`w-2 h-2 rounded-full ${getTypeColor(deadline.type)} mt-2`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="mb-1 group-hover:text-blue-600 transition-colors">
                            {deadline.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{deadline.group}</Badge>
                            <Badge variant="outline">{deadline.type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-600">
                            {getTimeRemaining(deadline.dueDate)}
                          </p>
                          <p className="text-gray-500">
                            {new Date(deadline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={65} className="h-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 group"
                    onClick={() => navigate('/bot')}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </motion.div>
                    <span className="group-hover:text-purple-600 transition-colors">Ask Bot Anything</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 group"
                    onClick={() => navigate('/groups')}
                  >
                    <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:text-blue-600 transition-colors">Join Group by Code</span>
                  </Button>
                </motion.div>
                {(user.role === 'Faculty' || user.role === 'CR') && (
                  <motion.div whileHover={{ scale: 1.05, x: 5 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3 group"
                      onClick={() => navigate('/groups')}
                    >
                      <FileText className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:text-green-600 transition-colors">Create Post</span>
                    </Button>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4>Your Stats</h4>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Assignments Done</span>
                      <motion.span
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        0/0
                      </motion.span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Attendance</span>
                      <motion.span
                        className="text-green-600"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        0%
                      </motion.span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3>Recent Announcements</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="p-4 rounded-lg border hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${getTypeColor(announcement.type)} flex items-center justify-center flex-shrink-0`}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1 line-clamp-1">{announcement.title}</h4>
                      <Badge variant="secondary" className="text-xs">{announcement.group}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-2">
                    {announcement.excerpt}
                  </p>
                  <p className="text-gray-400">{announcement.time}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
