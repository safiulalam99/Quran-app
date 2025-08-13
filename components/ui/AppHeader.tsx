'use client';

import { motion } from 'framer-motion';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function AppHeader({
  title,
  subtitle,
  showProgress = false,
  progress = 0,
}: AppHeaderProps) {
  return (
    <motion.header
      className="text-center py-6 px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {title}
        </span>
      </motion.h1>
      
      {subtitle && (
        <motion.p
          className="text-gray-600 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
      )}

      {showProgress && (
        <motion.div
          className="max-w-xs mx-auto mt-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-sm text-gray-500 mt-1 block">
            {Math.round(progress)}% Complete
          </span>
        </motion.div>
      )}
    </motion.header>
  );
}