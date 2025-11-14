import { motion } from 'motion/react';
import { AppLayout } from './AppLayout';
import { User } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  MessageSquare, 
  Bot, 
  UserX, 
  Bell,
  ArrowLeft,
  ExternalLink,
  Code
} from 'lucide-react';

interface DocsPageProps {
  navigate: (route: string) => void;
  user: User | null;
  logout: () => void;
}

export function DocsPage({ navigate, user, logout }: DocsPageProps) {
  const content = user ? (
    <AppLayout user={user} navigate={navigate} logout={logout} currentRoute="/docs">
      <DocsContent navigate={navigate} />
    </AppLayout>
  ) : (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={() => navigate('/auth/login')}>Login</Button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <DocsContent navigate={navigate} />
      </div>
    </div>
  );

  return content;
}

function DocsContent({ navigate }: { navigate: (route: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="mb-1">Documentation</h1>
            <p className="text-gray-600">Everything you need to know about ClassBot</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Getting Started', icon: BookOpen, desc: 'Learn the basics' },
          { title: 'Using the Bot', icon: Bot, desc: 'AI assistant guide' },
          { title: 'Group Chat', icon: MessageSquare, desc: 'Collaboration features' },
          { title: 'Anonymous Mode', icon: UserX, desc: 'Privacy & security' },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <item.icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Documentation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <div className="prose max-w-none">
            <h2>Getting Started with ClassBot</h2>
            <p>
              ClassBot is your complete classroom communication hub. It combines group chat, 
              AI-powered assistance, and smart deadline management to help you stay organized 
              and connected with your courses.
            </p>

            <h3>Creating and Joining Groups</h3>
            <p>
              Groups are the foundation of ClassBot. Each group represents a class, study group, 
              or project team. You can:
            </p>
            <ul>
              <li>Create new groups and invite members</li>
              <li>Join existing groups using group codes</li>
              <li>Manage group settings if you're an admin</li>
              <li>Post assignments, events, and resources</li>
            </ul>

            <h3>Using the Personal Bot</h3>
            <p>
              Your AI assistant can help you find information across all your groups:
            </p>
            <ul>
              <li><strong>Ask Questions:</strong> Get instant answers from your course materials</li>
              <li><strong>Find Resources:</strong> Search across PDFs, posts, and attachments</li>
              <li><strong>Track Deadlines:</strong> Query upcoming assignments and events</li>
              <li><strong>Escalate Issues:</strong> Forward unanswered questions to admins</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <div className="flex gap-3">
                <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Pro Tip</p>
                  <p className="text-blue-800">
                    The bot learns from your group posts and attachments. The more content 
                    in your groups, the better the answers!
                  </p>
                </div>
              </div>
            </div>

            <h3>Anonymous Mode</h3>
            <p>
              Ask questions without revealing your identity:
            </p>
            <ul>
              <li>Toggle anonymous mode in the bot interface</li>
              <li>Your questions will be sent to admins without your name</li>
              <li>Admins can still reply to you privately</li>
              <li>Set anonymous as default in your preferences</li>
            </ul>

            <h3>Smart Reminders</h3>
            <p>
              Never miss a deadline with customizable reminders:
            </p>
            <ul>
              <li>Automatic reminders 24 hours, 3 hours, and 30 minutes before deadlines</li>
              <li>Email and push notification options</li>
              <li>Customize reminder timing in settings</li>
              <li>Subscribe to specific assignment reminders</li>
            </ul>

            <h3>For Admins & Faculty</h3>
            <p>
              Class representatives and faculty have additional features:
            </p>
            <ul>
              <li><strong>Create Posts:</strong> Share assignments, events, and announcements</li>
              <li><strong>Manage Tickets:</strong> Answer student questions from the admin inbox</li>
              <li><strong>Mark as FAQ:</strong> Convert common questions to FAQ entries</li>
              <li><strong>Post Publicly:</strong> Share answers with the entire group</li>
            </ul>

            <h3>Tips for Best Results</h3>
            <ol>
              <li>Keep group posts well-organized with clear titles</li>
              <li>Upload course materials as PDFs for bot to search</li>
              <li>Use tags to categorize posts</li>
              <li>Pin important announcements</li>
              <li>Provide feedback on bot answers to improve results</li>
            </ol>

            <h3>Privacy & Data</h3>
            <p>
              ClassBot is designed with student privacy in mind:
            </p>
            <ul>
              <li>Anonymous mode protects your identity</li>
              <li>Only group members can see group content</li>
              <li>You control your notification preferences</li>
              <li>Delete your data anytime from settings</li>
            </ul>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-4">
              <div className="flex gap-3">
                <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-orange-900 mb-1">Important Note</p>
                  <p className="text-orange-800">
                    ClassBot is not meant for collecting personally identifiable information (PII) 
                    or securing highly sensitive data. Use it for educational collaboration only.
                  </p>
                </div>
              </div>
            </div>

            <h3>Support & Resources</h3>
            <p>
              Need help? Here's where to go:
            </p>
            <ul>
              <li>
                <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                  GitHub Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                  Report an Issue
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                  API Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>

      {/* API Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <h3>API Example</h3>
            <Badge variant="outline">Optional</Badge>
          </div>
          <p className="text-gray-600 mb-4">
            For developers: Here's how to query the bot programmatically
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`POST /api/personal/query
{
  "text": "What is the deadline for Assignment 3?",
  "userId": "user123",
  "anonymous": false
}

Response:
{
  "answer": "Assignment 3 is due on Nov 15 at 11:59 PM",
  "sources": [...],
  "confidence": 92
}`}
          </pre>
        </Card>
      </motion.div>
    </div>
  );
}
