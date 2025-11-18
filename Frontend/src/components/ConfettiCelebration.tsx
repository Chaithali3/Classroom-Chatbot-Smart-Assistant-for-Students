import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiCelebrationProps {
  trigger: boolean;
  message?: string;
}

export function ConfettiCelebration({ trigger, message }: ConfettiCelebrationProps) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(newConfetti);

      setTimeout(() => {
        setShow(false);
        setConfetti([]);
      }, 3000);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              left: `${piece.x}%`,
            }}
            initial={{
              y: piece.y,
              rotation: piece.rotation,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotation: piece.rotation + 720,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              ease: "easeIn",
            }}
          />
        ))}
      </AnimatePresence>

      {message && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 text-center pointer-events-auto"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <h2 className="text-4xl mb-2">🎉</h2>
            <h3 className="mb-2">{message}</h3>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
