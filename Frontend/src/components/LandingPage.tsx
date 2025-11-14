import { motion } from 'motion/react';
import { Button } from './ui/button';
import { MessageSquare, Bot, UserX, Bell, ArrowRight, Users, Zap, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FloatingParticles } from './FloatingParticles';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export function LandingPage({ navigate }: LandingPageProps) {
  const features = [
    {
      icon: MessageSquare,
      title: 'Group Chat',
      description: 'Organized discussions for every class and project',
      color: 'bg-blue-500'
    },
    {
      icon: Bot,
      title: 'Personal Bot',
      description: 'AI assistant with instant answers from course materials',
      color: 'bg-purple-500'
    },
    {
      icon: UserX,
      title: 'Anonymous Mode',
      description: 'Ask questions without revealing your identity',
      color: 'bg-green-500'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss a deadline with timely notifications',
      color: 'bg-orange-500'
    }
  ];

  const steps = [
    { number: '01', title: 'Create or Join Group', description: 'Use group codes to connect with classmates' },
    { number: '02', title: 'Post Updates & Resources', description: 'Share assignments, events, and materials' },
    { number: '03', title: 'Ask Your AI Bot', description: 'Get instant answers from your knowledge base' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl">ClassBot</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/docs')}>
              Docs
            </Button>
            <Button variant="ghost" onClick={() => navigate('/auth/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 2 }}
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              ✨ AI-Powered Classroom Assistant
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            Your Complete Classroom
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Communication Hub
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Connect with classmates, get instant AI-powered answers, and never miss a deadline.
            Built for students, by students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/auth/login')} className="group">
              Try Demo
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth/signup')}>
              Get Started Free
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 relative"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-20 rounded-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="relative bg-white rounded-2xl shadow-2xl p-2 border"
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop"
                alt="Students collaborating"
                className="w-full h-96 object-cover rounded-xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="mb-4">Powerful Features for Modern Learning</h2>
          <p className="text-gray-600 text-lg">Everything you need to stay organized and connected</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -12, 
                rotate: [0, 2, -2, 0],
                transition: { duration: 0.3 } 
              }}
              className="bg-white rounded-2xl p-6 shadow-lg border cursor-pointer group"
            >
              <motion.div 
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-blue-50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">Get started in three simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
                  <span className="text-xl">{step.number}</span>
                </div>
                <h3 className="mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-purple-300" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Users, title: 'Community Driven', desc: 'Built with student feedback and collaboration' },
            { icon: Zap, title: 'Lightning Fast', desc: 'Instant answers and real-time updates' },
            { icon: Shield, title: 'Privacy First', desc: 'Anonymous mode and secure data handling' }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <item.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl"
        >
          <h2 className="mb-4 text-white">Ready to Transform Your Classroom?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students already using ClassBot
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth/signup')}>
            Get Started Free
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span>ClassBot</span>
            </div>
            <div className="flex gap-6 text-gray-600">
              <button onClick={() => navigate('/docs')}>Docs</button>
              <a href="#" className="hover:text-blue-600">GitHub</a>
              <a href="#" className="hover:text-blue-600">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
