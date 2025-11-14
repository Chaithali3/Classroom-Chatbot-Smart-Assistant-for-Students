import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Dashboard } from './components/Dashboard';
import { GroupsPage } from './components/GroupsPage';
import { GroupDetailPage } from './components/GroupDetailPage';
import { PersonalBot } from './components/PersonalBot';
import { AdminTickets } from './components/AdminTickets';
import { NotificationsPage } from './components/NotificationsPage';
import { ProfilePage } from './components/ProfilePage';
import { DocsPage } from './components/DocsPage';
import { Toaster } from './components/ui/sonner';

export type Route = 
  | '/' 
  | '/auth/login' 
  | '/auth/signup' 
  | '/dashboard' 
  | '/groups' 
  | '/groups/:id'
  | '/bot' 
  | '/admin/tickets' 
  | '/notifications' 
  | '/profile'
  | '/docs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'CR' | 'Faculty';
  avatar?: string;
}

function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [user, setUser] = useState<User | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  const login = (userData: User) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

  const renderPage = () => {
    if (currentRoute === '/') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentRoute === '/auth/login') {
      return <LoginPage navigate={navigate} onLogin={login} />;
    }
    if (currentRoute === '/auth/signup') {
      return <SignupPage navigate={navigate} onSignup={login} />;
    }
    if (currentRoute === '/dashboard' && user) {
      return <Dashboard user={user} navigate={navigate} logout={logout} />;
    }
    if (currentRoute === '/groups' && user) {
      return <GroupsPage user={user} navigate={navigate} logout={logout} onSelectGroup={(id) => {
        setSelectedGroupId(id);
        navigate('/groups/:id');
      }} />;
    }
    if (currentRoute === '/groups/:id' && user && selectedGroupId) {
      return <GroupDetailPage user={user} navigate={navigate} logout={logout} groupId={selectedGroupId} />;
    }
    if (currentRoute === '/bot' && user) {
      return <PersonalBot user={user} navigate={navigate} logout={logout} />;
    }
    if (currentRoute === '/admin/tickets' && user) {
      return <AdminTickets user={user} navigate={navigate} logout={logout} />;
    }
    if (currentRoute === '/notifications' && user) {
      return <NotificationsPage user={user} navigate={navigate} logout={logout} />;
    }
    if (currentRoute === '/profile' && user) {
      return <ProfilePage user={user} navigate={navigate} logout={logout} onUpdateUser={setUser} />;
    }
    if (currentRoute === '/docs') {
      return <DocsPage navigate={navigate} user={user} logout={logout} />;
    }
    
    return <LandingPage navigate={navigate} />;
  };

  return (
    <>
      {renderPage()}
      <Toaster />
    </>
  );
}

export default App;
