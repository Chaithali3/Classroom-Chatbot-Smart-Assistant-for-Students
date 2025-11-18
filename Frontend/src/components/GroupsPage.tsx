import { useState } from 'react';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Search, 
  Users, 
  Lock, 
  Globe,
  Hash,
  BookOpen,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupsPageProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
  onSelectGroup: (groupId: string) => void;
}

interface GroupItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  members?: number;
  privacy?: string;
  posts?: number;
  isAdmin?: boolean;
  isMember?: boolean;
  createdBy?: string;
  membersList?: Array<{
    id: string;
    name: string;
    role: 'Faculty' | 'CR' | 'Student';
    avatar?: string;
    isAdmin?: boolean;
    hasMessagePermission?: boolean;
  }>;
}

// Start with no pre-created groups — the UI will be empty until the user creates or joins groups
// This lets you start fresh in the app during testing or onboarding
const initialGroups: GroupItem[] = [];

export function GroupsPage({ user, navigate, logout, onSelectGroup }: GroupsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [newGroup, setNewGroup] = useState({
    name: '',
    code: 'GRP-' + Math.floor(Math.random() * 10000),
    description: '',
    privacy: 'Open',
    tags: ''
  });

    // Load persisted groups from localStorage so group creators remain admins across pages
    const STORAGE_KEY = `groups_v1_${user.id}`;
  const loadGroups = (): GroupItem[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialGroups;
      return JSON.parse(raw) as GroupItem[];
    } catch (err) {
      return initialGroups;
    }
  };

  const [groups, setGroups] = useState<GroupItem[]>(loadGroups());

  // Persist groups whenever they change.
  // Merge with existing storage to reduce race conditions and dedupe by `code`.
  const persistGroups = (next: GroupItem[]) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as GroupItem[]) : [];
      // prefer entries from `next` (they are the most recent) then fall back to existing
      const combined = [...next, ...existing];
      const seen = new Set<string>();
      const deduped: GroupItem[] = [];
      for (const g of combined) {
        const code = (g.code || '').toString().toLowerCase();
        if (!code) continue;
        if (seen.has(code)) continue;
        seen.add(code);
        deduped.push(g);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    } catch (err) {
      // ignore
    }
  };

  // Prevent duplicate join actions when user clicks rapidly
  const joinInProgress = useRef<Record<string, boolean>>({});

  const handleCreateGroup = () => {
    const created: GroupItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,8),
      name: newGroup.name || 'Untitled Group',
      code: newGroup.code,
      description: newGroup.description,
      privacy: newGroup.privacy,
      members: 1,
      posts: 0,
      isAdmin: true,
      isMember: true
      ,createdBy: user.id,
      membersList: [
        {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          isAdmin: true,
          hasMessagePermission: true
        }
      ]
    };
    setGroups(prev => {
      const next = [created, ...prev];
      persistGroups(next);
      return next;
    });
    toast.success(`Group "${created.name}" created successfully!`);
    setCreateGroupOpen(false);
    setNewGroup({
      name: '',
      code: 'GRP-' + Math.floor(Math.random() * 10000),
      description: '',
      privacy: 'Open',
      tags: ''
    });
  };

  const handleJoinByCode = () => {
    if (joinCode.trim()) {
      // If a group with this code already exists, update it instead of creating duplicates
      const codeNormalized = joinCode.trim().toLowerCase();
      // Prevent double-submit for same code
      if (joinInProgress.current[codeNormalized]) {
        return;
      }
      joinInProgress.current[codeNormalized] = true;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const existing = raw ? (JSON.parse(raw) as GroupItem[]) : groups;
        const idx = existing.findIndex(g => (g.code || '').toString().toLowerCase() === codeNormalized);
        if (idx !== -1) {
          // update existing record: mark as member and add to membersList
          const g = existing[idx];
          g.isMember = true;
          g.members = (g.members || 0) + 1;
          g.membersList = g.membersList || [];
          if (!g.membersList.some(m => m.id === user.id)) {
            g.membersList.push({ id: user.id, name: user.name, role: user.role, avatar: user.avatar, isAdmin: false, hasMessagePermission: true });
          }
          existing[idx] = g;
          persistGroups(existing);
          setGroups(existing);
        } else {
          // Create a minimal group record to represent the joined group
          const joined: GroupItem = {
            id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,6),
            name: `Group ${joinCode}`,
            code: joinCode,
            description: '',
            members: 1,
            posts: 0,
            isAdmin: false,
            isMember: true,
            createdBy: undefined,
            membersList: [{ id: user.id, name: user.name, role: user.role, avatar: user.avatar, isAdmin: false, hasMessagePermission: true }]
          };
          setGroups(prev => {
            const next = [joined, ...prev];
            persistGroups(next);
            return next;
          });
        }
      } catch (err) {
        // fallback to creating a new group in-memory
        const joined: GroupItem = {
          id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,6),
          name: `Group ${joinCode}`,
          code: joinCode,
          description: '',
          members: 1,
          posts: 0,
          isAdmin: false,
          isMember: true,
          createdBy: undefined,
          membersList: [{ id: user.id, name: user.name, role: user.role, avatar: user.avatar, isAdmin: false, hasMessagePermission: true }]
        };
        setGroups(prev => {
          const next = [joined, ...prev];
          persistGroups(next);
          return next;
        });
      } finally {
        joinInProgress.current[codeNormalized] = false;
      }
      toast.success('Successfully joined the group!');
      setJoinGroupOpen(false);
      setJoinCode('');
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.code?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'joined') return matchesSearch && group.isMember;
    if (activeTab === 'admin') return matchesSearch && group.isAdmin;
    return matchesSearch;
  });

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/groups">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2">My Groups</h1>
              <p className="text-gray-600">Manage your class groups and collaborations</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Hash className="w-4 h-4 mr-2" />
                    Join by Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join Group by Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Group Code</Label>
                      <Input
                        placeholder="Enter group code (e.g., CS-301)"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleJoinByCode} className="w-full">
                      Join Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input
                          placeholder="e.g., Data Structures"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Group Code</Label>
                        <Input
                          placeholder="Auto-generated"
                          value={newGroup.code}
                          onChange={(e) => setNewGroup({ ...newGroup, code: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What's this group about?"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Privacy</Label>
                      <Select value={newGroup.privacy} onValueChange={(value: string) => setNewGroup({ ...newGroup, privacy: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open - Anyone can join</SelectItem>
                          <SelectItem value="Invite-only">Invite-only - Admin approval required</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input
                        placeholder="e.g., CS, Spring2025, Advanced"
                        value={newGroup.tags}
                        onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleCreateGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search groups..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="joined">Joined</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>
        </motion.div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02, rotate: 1 }}
            >
              <Card className="p-6 h-full flex flex-col cursor-pointer hover:shadow-2xl transition-all group border-2 hover:border-blue-200"
                    onClick={() => onSelectGroup(group.id)}>
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </motion.div>
                  {group.privacy === 'Open' ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-orange-500" />
                  )}
                </div>

                <h3 className="mb-2">{group.name}</h3>
                <Badge variant="secondary" className="mb-3 w-fit">{group.code}</Badge>
                
                <p className="text-gray-600 mb-4 flex-1 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center gap-4 text-gray-500 mb-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{group.members}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{group.posts} posts</span>
                  </div>
                  {group.isAdmin && (
                    <Badge variant="outline" className="ml-auto">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {group.isMember ? (
                    <Button className="flex-1" onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onSelectGroup(group.id);
                    }}>
                      Open
                    </Button>
                  ) : (
                    <Button className="flex-1" variant="outline" onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      const key = (group.id || group.code || '').toString();
                      if (joinInProgress.current[key]) return;
                      joinInProgress.current[key] = true;
                      try {
                        const raw = localStorage.getItem(STORAGE_KEY);
                        const parsed = raw ? (JSON.parse(raw) as GroupItem[]) : groups;
                        const idx = parsed.findIndex(g => g.id === group.id);
                        if (idx !== -1) {
                          const g = parsed[idx];
                          g.isMember = true;
                          g.members = (g.members || 0) + 1;
                          g.membersList = g.membersList || [];
                          if (!g.membersList.some(m => m.id === user.id)) {
                            g.membersList.push({ id: user.id, name: user.name, role: user.role, avatar: user.avatar, isAdmin: false, hasMessagePermission: true });
                          }
                          parsed[idx] = g;
                          persistGroups(parsed);
                          setGroups(parsed);
                        }
                      } catch (err) {
                        // ignore
                      } finally {
                        joinInProgress.current[key] = false;
                      }
                      toast.success('Joined group successfully!');
                    }}>
                      Join
                    </Button>
                  )}
                  {group.isAdmin && (
                    <Button variant="outline" size="icon" onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toast.info('Group settings');
                    }}>
                      <Crown className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or create a new group</p>
            <Button onClick={() => setCreateGroupOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
