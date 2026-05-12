import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function WelcomeAnimation() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide after 3.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

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
            <motion.img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Bismillah.svg/1024px-Bismillah.svg.png" 
              alt="Bismillah"
              className="w-64 invert opacity-90 sepia-[.3] hue-rotate-[190deg]" // Styling to fit dark mode better
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
            />
            <motion.h1 
              className="text-2xl font-semibold text-gray-200 tracking-wide font-sans leading-relaxed"
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
