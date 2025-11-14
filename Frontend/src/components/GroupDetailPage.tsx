import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  MessageSquare,
  Plus,
  Pin,
  Calendar,
  Paperclip,
  Send,
  MoreVertical,
  Download,
  Crown,
  Settings,
  Shield,
  UserPlus,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GroupDetailPageProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
  groupId: string;
}

interface Member {
  id: string;
  name: string;
  role: 'Faculty' | 'CR' | 'Student';
  avatar?: string;
  isAdmin?: boolean;
  hasMessagePermission?: boolean;
}

export function GroupDetailPage({ user, navigate, logout, groupId }: GroupDetailPageProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [managePermissionsOpen, setManagePermissionsOpen] = useState(false);
  // Start with no members, posts, messages or files — fresh state for new groups
  const [members, setMembers] = useState<Member[]>([]);
  const [chatPermissionMode, setChatPermissionMode] = useState<'everyone' | 'admin-only' | 'permission-based'>('everyone');
  const [posts, setPosts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'Notice',
    deadline: '',
    attachments: ''
  });

  const currentUserMember = members.find(m => m.name === user.name);
  const canSendMessage = currentUserMember?.isAdmin || (chatPermissionMode === 'everyone') || (chatPermissionMode === 'permission-based' && currentUserMember?.hasMessagePermission);

  const handleCreatePost = () => {
    const created = {
      id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,6),
      title: newPost.title || 'Untitled',
      author: user.name,
      authorRole: user.role,
      type: newPost.type,
      content: newPost.content,
      deadline: newPost.deadline || null,
      attachments: newPost.attachments ? newPost.attachments.split(',').map(s => s.trim()) : [],
      pinned: false,
      createdAt: 'just now'
    };
    setPosts(prev => [created, ...prev]);
    toast.success('✅ Post created successfully!');
    setCreatePostOpen(false);
    setNewPost({ title: '', content: '', type: 'Notice', deadline: '', attachments: '' });
  };

  const handleSendMessage = () => {
    if (!canSendMessage) {
      toast.error('❌ You don\'t have permission to send messages in this group');
      return;
    }
    if (chatMessage.trim()) {
      toast.success('✅ Message sent!');
      setChatMessage('');
    }
  };

  const toggleAdmin = (memberId: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
    ));
    const member = members.find(m => m.id === memberId);
    toast.success(`${member?.name} is now ${member?.isAdmin ? 'removed as' : 'promoted to'} admin! 👑`);
  };

  const toggleMessagePermission = (memberId: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, hasMessagePermission: !m.hasMessagePermission } : m
    ));
    const member = members.find(m => m.id === memberId);
    toast.success(`Message permission ${member?.hasMessagePermission ? 'revoked from' : 'granted to'} ${member?.name}!`);
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
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/groups/:id">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={() => navigate('/groups')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </motion.div>

          <Card className="p-6 shadow-lg border-2">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex gap-4">
                <motion.div 
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 30px rgba(168, 85, 247, 0.6)',
                      '0 0 20px rgba(236, 72, 153, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FileText className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="mb-1">{`Group ${groupId || ''}` || 'Unnamed Group'}</h2>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-blue-600">{groupId}</Badge>
                    {currentUserMember?.isAdmin && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                      >
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      </motion.div>
                    )}
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                  <p className="text-gray-600">No description yet.</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="icon">
                    <Users className="w-4 h-4" />
                  </Button>
                </motion.div>
                {currentUserMember?.isAdmin && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline">Share Code</Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts and Chat */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg border-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <TabsList>
                    <TabsTrigger value="posts">📝 Posts</TabsTrigger>
                    <TabsTrigger value="chat">💬 Live Chat</TabsTrigger>
                  </TabsList>
                  
                  {activeTab === 'posts' && (user.role === 'Faculty' || user.role === 'CR' || mockGroup.isAdmin) && (
                    <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                      <DialogTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Post
                          </Button>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="Post title"
                              value={newPost.title}
                              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea
                              placeholder="What would you like to share?"
                              rows={6}
                              value={newPost.content}
                              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select value={newPost.type} onValueChange={(value) => setNewPost({ ...newPost, type: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Assignment">Assignment</SelectItem>
                                  <SelectItem value="Event">Event</SelectItem>
                                  <SelectItem value="Notice">Notice</SelectItem>
                                  <SelectItem value="Resource">Resource</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(newPost.type === 'Assignment' || newPost.type === 'Event') && (
                              <div className="space-y-2">
                                <Label>Deadline</Label>
                                <Input
                                  type="datetime-local"
                                  value={newPost.deadline}
                                  onChange={(e) => setNewPost({ ...newPost, deadline: e.target.value })}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Attachments</Label>
                            <Input type="file" />
                          </div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={handleCreatePost} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                              Create Post
                            </Button>
                          </motion.div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <TabsContent value="posts" className="space-y-4 mt-0">
                  {posts.length === 0 ? (
                    <div className="p-6 text-gray-500">No posts yet. Create the first post using the Create Post button.</div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {posts.map((post: any, index: number) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <Card className={`p-6 shadow-md ${post.pinned ? 'border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50' : 'border'}`}>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex gap-3">
                                <motion.div 
                                  className={`w-10 h-10 rounded-lg ${getTypeColor(post.type)} flex items-center justify-center flex-shrink-0 shadow-md`}
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <FileText className="w-5 h-5 text-white" />
                                </motion.div>
                                <div className="flex-1">
                                  <div className="flex items-start gap-2 mb-2">
                                    <h4>{post.title}</h4>
                                    {post.pinned && (
                                      <motion.div
                                        animate={{ rotate: [0, -10, 10, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                      >
                                        <Pin className="w-4 h-4 text-blue-600" />
                                      </motion.div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="text-gray-600">{post.author}</span>
                                    <Badge variant="outline" className="text-xs">{post.authorRole}</Badge>
                                    <span className="text-gray-400">• {post.createdAt}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>

                            <p className="text-gray-700 mb-4">{post.content}</p>

                            <div className="flex items-center gap-4 flex-wrap">
                              <Badge>{post.type}</Badge>
                              {post.deadline && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>Due: {new Date(post.deadline).toLocaleDateString()}</span>
                                </div>
                              )}
                              {post.attachments?.length > 0 && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Paperclip className="w-4 h-4" />
                                  <span>{post.attachments.length} attachment(s)</span>
                                </div>
                              )}
                            </div>

                            {post.attachments?.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                {post.attachments.map((file: any) => (
                                  <motion.div 
                                    key={file} 
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    whileHover={{ x: 5 }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                      <span>{file}</span>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <div className="flex flex-col h-[600px]">
                    {/* Chat Permission Info */}
                    <motion.div 
                      className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        {canSendMessage ? (
                          <>
                            <Unlock className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">You can send messages in this chat</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-700">Only admins and permitted users can send messages</span>
                          </>
                        )}
                      </div>
                    </motion.div>

                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {messages.length === 0 ? (
                            <div className="p-4 text-gray-500">No messages yet. Start the conversation below.</div>
                          ) : (
                            messages.map((msg: any, idx: number) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.01, x: 5 }}
                                className="flex gap-3"
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={msg.avatar} />
                                  <AvatarFallback>{msg.sender?.[0] ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{msg.sender}</span>
                                    <span className="text-xs text-gray-400">{msg.time}</span>
                                  </div>
                                  <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg rounded-tl-none p-3 border shadow-sm">
                                    <p>{msg.message}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2 pt-4 border-t mt-4">
                      <Input
                        placeholder={canSendMessage ? "Type a message..." : "You don't have permission to send messages"}
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={!canSendMessage}
                        className={!canSendMessage ? 'bg-gray-100' : ''}
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="icon" onClick={handleSendMessage} disabled={!canSendMessage} className="bg-gradient-to-r from-blue-600 to-purple-600">
                          <Send className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6 shadow-lg border-2">
                <div className="flex items-center justify-between mb-4">
                  <h4>👥 Members ({members.length})</h4>
                  {members.some(m => m.isAdmin) && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" size="sm" onClick={() => setManagePermissionsOpen(true)}>
                        <Shield className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </motion.div>
                  )}
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {members.map((member, idx) => (
                      <motion.div 
                        key={member.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <Avatar className="w-10 h-10 border-2 border-blue-200">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p>{member.name}</p>
                            {member.isAdmin && (
                              <Crown className="w-3 h-3 text-yellow-600" />
                            )}
                            {member.hasMessagePermission && !member.isAdmin && (
                              <MessageSquare className="w-3 h-3 text-green-600" />
                            )}
                          </div>
                          <p className="text-gray-500">{member.role}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>

            {/* Files */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 shadow-lg border-2">
                <h4 className="mb-4">📁 Group Files</h4>
                <div className="space-y-2">
                  {files.length === 0 ? (
                    <div className="p-4 text-gray-500">No files uploaded yet.</div>
                  ) : (
                    files.map((file: any, idx: number) => (
                      <motion.div 
                        key={file.id} 
                        className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <FileText className="w-4 h-4 text-gray-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{file.name}</p>
                          <p className="text-gray-500">{file.size}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Group Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Group Settings
              </DialogTitle>
              <DialogDescription>
                Manage group permissions and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <h4>Chat Permissions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:border-blue-300 transition-colors">
                    <div>
                      <Label>Everyone can send messages</Label>
                      <p className="text-gray-500 text-sm">All group members can chat</p>
                    </div>
                    <Switch
                      checked={chatPermissionMode === 'everyone'}
                      onCheckedChange={(checked) => {
                        setChatPermissionMode(checked ? 'everyone' : 'permission-based');
                        toast.success(checked ? '✅ Everyone can now send messages!' : 'ℹ️ Permission-based mode enabled');
                      }}
                    />
                  </div>
                  
                  {chatPermissionMode !== 'everyone' && (
                    <motion.div 
                      className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <p className="text-blue-700 mb-2">Permission-based mode is active</p>
                      <p className="text-blue-600 text-sm">Use "Manage Permissions" to grant message access to specific members</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => {
                    setSettingsOpen(false);
                    setManagePermissionsOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Member Permissions
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Permissions Dialog */}
        <Dialog open={managePermissionsOpen} onOpenChange={setManagePermissionsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Manage Member Permissions
              </DialogTitle>
              <DialogDescription>
                Grant admin rights and message permissions to members
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-3 pt-4">
                {members.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    className="p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:border-blue-200 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12 border-2 border-blue-200">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.isAdmin && <Crown className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <p className="text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <motion.div 
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          <Label>Admin Rights</Label>
                        </div>
                        <Switch
                          checked={member.isAdmin}
                          onCheckedChange={() => toggleAdmin(member.id)}
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <Label>Message Permission</Label>
                        </div>
                        <Switch
                          checked={member.hasMessagePermission || member.isAdmin}
                          onCheckedChange={() => toggleMessagePermission(member.id)}
                          disabled={member.isAdmin}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
