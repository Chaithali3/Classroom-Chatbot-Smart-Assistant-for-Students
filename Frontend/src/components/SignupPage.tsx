import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bot, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../App';

interface SignupPageProps {
  navigate: (route: string) => void;
  onSignup: (user: User) => void;
}

export function SignupPage({ navigate, onSignup }: SignupPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student' as 'Student' | 'CR' | 'Faculty'
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    // Check for existing account
    try {
      const raw = localStorage.getItem('users_v1');
      const users = raw ? (JSON.parse(raw) as any[]) : [];
      if (users.some(u => (u.email || '').toLowerCase() === formData.email.toLowerCase())) {
        toast.error('An account with that email already exists. Please sign in.');
        return;
      }

      // Create and persist the user (demo plaintext password)
      const uid = (window.crypto && (window.crypto as any).randomUUID && (window.crypto as any).randomUUID()) || `u_${Date.now()}`;
      const newUser = {
        id: uid,
        name: formData.username,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`
      };
      const next = [newUser, ...users];
      localStorage.setItem('users_v1', JSON.stringify(next));

      toast.success('Account created successfully! You are now signed in.');
      setTimeout(() => {
        onSignup({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar
        });
      }, 500);
      return;
    } catch (err) {
      toast.error('Signup failed — please try again.');
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
            <h2 className="mb-2">Create Account</h2>
            <p className="text-gray-600">Join ClassBot and start learning</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="CR">Class Representative</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/auth/login')}
              >
                Sign in
              </Button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
