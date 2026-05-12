import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIDEStore } from '../stores/ideStore';

export function WelcomeAnimation() {
  const { hasShownWelcome, setHasShownWelcome } = useIDEStore();
  const [isVisible, setIsVisible] = useState(!hasShownWelcome);

  useEffect(() => {
    if (hasShownWelcome) return;

    // Hide after 4.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setHasShownWelcome(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, [hasShownWelcome, setHasShownWelcome]);

  if (hasShownWelcome) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1e1e] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          <motion.div 
            className="flex flex-col items-center gap-6 max-w-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
            >
              {/* Reliable Logo/Symbol for Bismillah */}
              <div className="text-6xl text-ide-accent mb-2">﷽</div>
              <div className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em]">Bismillah</div>
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-semibold text-gray-200 tracking-wide font-sans leading-relaxed px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              Bismillah, I am starting this project, trusting in the grace of Allah and by his mercy.
            </motion.h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
