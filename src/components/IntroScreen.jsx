import React from 'react';
import { motion } from 'framer-motion';

const IntroScreen = () => {
  const appName = "Excellence";
  const caption = "An Excellent Study Companion";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.7, ease: "anticipate" }
    }
  };

  const nameVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.8,
      },
    },
  };

  const captionVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
        duration: 0.8,
      },
    },
  };

  const gradientText = `text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-8"
    >
      <motion.h1
        variants={nameVariants}
        className={`text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter ${gradientText} mb-4 select-none`}
        style={{ fontFamily: "'Poppins', sans-serif" }} 
      >
        {appName.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale:0.5, rotate: Math.random() * 90 - 45 }}
            animate={{ opacity: 1, scale:1, rotate: 0 }}
            transition={{ delay: 0.5 + index * 0.1, type:"spring", stiffness:300, damping:15 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        variants={captionVariants}
        className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-300 tracking-wide select-none"
        style={{ fontFamily: "'Roboto Slab', serif" }}
      >
        {caption}
      </motion.p>
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-primary rounded-full"
        initial={{width:0}}
        animate={{width: "8rem"}}
        transition={{duration:2.8, ease:"linear"}}
      />
    </motion.div>
  );
};

export default IntroScreen;