import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserIntroScreen = ({ userName, userPhoto }) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "circOut",
        staggerChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
  };
  
  const nameParts = userName.split(" ");
  const displayName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1].charAt(0)}.` : userName;


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-700 p-8"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-white shadow-2xl">
          <AvatarImage src={userPhoto || '/placeholder-avatar.png'} alt={userName} />
          <AvatarFallback className="text-4xl sm:text-5xl bg-slate-200 text-primary">
            {userName?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      
      <motion.p 
        variants={itemVariants}
        className="text-2xl sm:text-3xl font-light text-slate-200 mb-1 select-none"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        Welcome back,
      </motion.p>
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight select-none"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {displayName}
      </motion.h1>
      
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/50 rounded-full"
        initial={{width:0}}
        animate={{width: "10rem"}}
        transition={{duration:3.8, ease:"linear"}}
      />
    </motion.div>
  );
};

export default UserIntroScreen;