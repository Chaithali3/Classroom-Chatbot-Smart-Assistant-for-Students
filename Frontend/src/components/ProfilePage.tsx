import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Settings, 
  Bell,
  Shield,
  Trash2,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { getTheme, setTheme } from '../utils/theme';

interface ProfilePageProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
  onUpdateUser: (user: User) => void;
}

export function ProfilePage({ user, navigate, logout, onUpdateUser }: ProfilePageProps) {
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    bio: 'Computer Science student passionate about algorithms and data structures.'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdateProfile = () => {
    onUpdateUser({ ...user, name: profile.name, email: profile.email });
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // Start with no pre-seeded groups — groups should be created or joined by the user
  const myGroups: Array<{ id: string; name: string; code: string; role: string }> = [];

  const [isDark, setIsDark] = useState<boolean>(() => getTheme() === 'dark');

  useEffect(() => {
    setIsDark(getTheme() === 'dark');
  }, []);

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full">
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <Badge>{user.role}</Badge>
              </div>

              <div className="flex-1">
                <h2 className="mb-1">{user.name}</h2>
                <p className="text-gray-600 mb-4">{user.email}</p>
                <div className="flex gap-4 text-gray-600">
                  <div>
                    <p className="text-2xl mb-1">{myGroups.length}</p>
                    <p>Groups</p>
                  </div>
                  <div>
                    <p className="text-2xl mb-1">0%</p>
                    <p>Attendance</p>
                  </div>
                  <div>
                    <p className="text-2xl mb-1">0</p>
                    <p>Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    <h3>Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Input
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={user.role} disabled />
                  </div>

                  <Button onClick={handleUpdateProfile}>Save Changes</Button>
                </div>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <h3>Change Password</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleChangePassword}>Change Password</Button>

                  <div className="pt-6 border-t">
                    <h4 className="mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p>Enable 2FA</p>
                        <p className="text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h3>Application Preferences</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-gray-600">Receive updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-gray-600">Browser notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Anonymous by Default</Label>
                        <p className="text-gray-600">Ask questions anonymously</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-gray-600">Switch to dark theme</p>
                      </div>
                      <Switch checked={isDark} onCheckedChange={(val: boolean) => { setIsDark(val); setTheme(val ? 'dark' : 'light'); }} />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h4 className="mb-4">Reminder Settings</h4>
                    <div className="space-y-3">
                      {['24 hours', '3 hours', '30 minutes'].map((time) => (
                        <div key={time} className="flex items-center justify-between">
                          <Label>{time} before deadline</Label>
                          <Switch defaultChecked={time !== '30 minutes'} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3>My Groups</h3>
                    </div>
                    <Button onClick={() => navigate('/groups')}>View All</Button>
                  </div>

                  <div className="space-y-3">
                    {myGroups.length === 0 ? (
                      <div className="p-6 text-center text-gray-600 bg-gray-50 rounded-lg">
                        You are not a member of any groups yet. Create or join a group to see it here.
                      </div>
                    ) : (
                      myGroups.map((group) => (
                        <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <p>{group.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{group.code}</Badge>
                              <Badge variant="outline">{group.role}</Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate('/groups')}>
                            Open
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3>Danger Zone</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p>Delete Account</p>
                  <p className="text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
