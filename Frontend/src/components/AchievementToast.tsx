import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, Zap, Target } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'target';
  show: boolean;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  if (!achievement?.show) return null;

  const icons = {
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
  };

  const Icon = icons[achievement.icon];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
        onAnimationComplete={() => {
          setTimeout(onClose, 3000);
        }}
      >
        <motion.div
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 p-1 rounded-2xl shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(251, 191, 36, 0.5)',
              '0 0 40px rgba(251, 191, 36, 0.8)',
              '0 0 20px rgba(251, 191, 36, 0.5)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h4 className="mb-1">🎉 {achievement.title}</h4>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
