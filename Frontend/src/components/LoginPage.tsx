import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Bot, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../App';

interface LoginPageProps {
  navigate: (route: string) => void;
  onLogin: (user: User) => void;
}

export function LoginPage({ navigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [role, setRole] = useState<'Student' | 'CR' | 'Faculty'>('Student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // If email is blank, keep the previous demo behaviour (quick anonymous/demo login)
    if (!email) {
      toast.success('Welcome back!');
      let uid = '';
      try {
        uid = (window.crypto && (window.crypto as any).randomUUID && (window.crypto as any).randomUUID()) || `u_${Date.now()}`;
      } catch (err) {
        uid = `u_${Date.now()}`;
      }
      const userEmail = role === 'Student' ? 'demo@student.com' : role === 'CR' ? 'demo@cr.com' : 'demo@faculty.com';
      const userName = role === 'Student' ? 'Student' : role === 'CR' ? 'CR' : 'Faculty';
      onLogin({
        id: uid,
        name: userName,
        email: userEmail,
        role: role,
        isSiteAdmin: isSiteAdmin,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`
      });
      return;
    }

    // Otherwise validate against persisted demo users in localStorage
    try {
      const raw = localStorage.getItem('users_v1');
      const users = raw ? (JSON.parse(raw) as any[]) : [];
      const found = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
      if (!found) {
        toast.error('No account found for that email. Please sign up.');
        return;
      }
      if ((found.password || '') !== password) {
        toast.error('Incorrect password.');
        return;
      }
      // Successful login
      toast.success('Welcome back!');
      onLogin({
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        isSiteAdmin: found.isSiteAdmin,
        avatar: found.avatar
      });
    } catch (err) {
      toast.error('Login failed — please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4"
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue to ClassBot</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="CR">Class Representative</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="cursor-pointer">
                  Remember me
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="siteAdmin"
                  checked={isSiteAdmin}
                  onCheckedChange={(checked) => setIsSiteAdmin(checked as boolean)}
                />
                <Label htmlFor="siteAdmin" className="cursor-pointer">
                  Site Admin (demo)
                </Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => toast.info('Password reset link sent to your email')}
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/auth/signup')}
              >
                Sign up
              </Button>
            </p>
          </div>
        </Card>

        <p className="text-center text-gray-500 mt-4">
          Demo: Use any email to login
        </p>
      </motion.div>
    </div>
  );
}
