import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  FileText,
  UserX,
  Send,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminTicketsProps {
  user: User;
  navigate: (route: string) => void;
  logout: () => void;
}

// Start with no pre-seeded tickets; read any stored tickets created during runtime
const STORAGE_KEY = 'admin_tickets_v1';

export function AdminTickets({ user, navigate, logout }: AdminTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');

  const [tickets, setTickets] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); } catch (e) {}
  }, [tickets]);

  const ticket = tickets.find((t: any) => t.id === selectedTicket);

  const handleReply = () => {
    if (replyText.trim()) {
      toast.success('Reply sent to student');
      setReplyText('');
      // mark ticket as assigned/answered locally for demo purposes
      if (selectedTicket) {
        setTickets(prev => prev.map(t => t.id === selectedTicket ? { ...t, status: 'assigned' } : t));
      }
    }
  };

  const handleMarkAsFAQ = () => {
    toast.success('Question marked as FAQ and added to knowledge base');
  };

  const handlePostPublic = () => {
    toast.success('Reply posted as public announcement');
  };

  const handleCloseTicket = () => {
    if (selectedTicket) {
      setTickets(prev => prev.map(t => t.id === selectedTicket ? { ...t, status: 'closed' } : t));
    }
    toast.success('Ticket closed');
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'assigned': return 'bg-orange-500';
      case 'closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    if (filter !== 'all' && ticket.status !== filter) return false;
    if (selectedGroup !== 'all' && ticket.group !== selectedGroup) return false;
    return true;
  });

  return (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/admin/tickets">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Admin Ticket Inbox</h1>
          <p className="text-gray-600">Manage student questions and escalations</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(
            () => {
              const total = tickets.length;
              const unresolved = tickets.filter(t => t.status !== 'closed').length;
              const resolvedToday = tickets.filter(t => false).length; // placeholder
              const highPriority = tickets.filter(t => t.priority === 'high').length;
              return [
                { label: 'Total Tickets', value: `${total}`, icon: Ticket, color: 'bg-blue-500' },
                { label: 'Unresolved', value: `${unresolved}`, icon: Clock, color: 'bg-orange-500' },
                { label: 'Resolved Today', value: `${resolvedToday}`, icon: CheckCircle2, color: 'bg-green-500' },
                { label: 'High Priority', value: `${highPriority}`, icon: AlertCircle, color: 'bg-red-500' },
              ];
            }
          )().map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">{stat.label}</p>
                    <h2 className="mb-0">{stat.value}</h2>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="CS-301">CS-301</SelectItem>
                <SelectItem value="PHY-201">PHY-201</SelectItem>
                <SelectItem value="MGT-101">MGT-101</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedTicket === ticket.id ? 'border-blue-500 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {ticket.anonymous ? (
                        <UserX className="w-5 h-5 text-gray-400" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                          {ticket.student[0]}
                        </div>
                      )}
                      <div>
                        <p>{ticket.student}</p>
                        <p className="text-gray-500">{ticket.createdAt}</p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{ticket.message}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{ticket.group}</Badge>
                    <Badge variant={getPriorityColor(ticket.priority) as any}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No tickets found</p>
              </div>
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {ticket ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {ticket.anonymous ? (
                            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                              <UserX className="w-6 h-6 text-gray-400" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                              {ticket.student[0]}
                            </div>
                          )}
                          <div>
                            <h3 className="mb-1">{ticket.student}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{ticket.group}</Badge>
                              <Badge variant={getPriorityColor(ticket.priority) as any}>
                                {ticket.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleMarkAsFAQ}>
                            <Star className="w-4 h-4 mr-1" />
                            Mark as FAQ
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCloseTicket}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Close
                          </Button>
                        </div>
                      </div>

                      {ticket.anonymous && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                          <UserX className="w-4 h-4 text-orange-600" />
                          <p className="text-orange-700">This is an anonymous question</p>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label className="mb-2 block">Student Question</Label>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p>{ticket.message}</p>
                      </div>
                    </div>

                    {/* Context */}
                    {ticket.context && ticket.context.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Related Context</Label>
                        <div className="space-y-2">
                          {ticket.context.map((ctx, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>{ctx}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply */}
                    <div>
                      <Label className="mb-2 block">Your Reply</Label>
                      <Textarea
                        placeholder="Type your response..."
                        rows={6}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button onClick={handleReply} className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Send Private Reply
                      </Button>
                      <Button variant="outline" onClick={handlePostPublic} className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Post Publicly
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <Select defaultValue="unassigned">
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                          <SelectItem value="prof-johnson">Prof. Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center h-full">
                <Ticket className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="mb-2">No Ticket Selected</h3>
                <p className="text-gray-600">Select a ticket from the list to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
