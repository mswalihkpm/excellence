import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserCircle, ShieldCheck, Building } from 'lucide-react';

const LoginTypeSelection = ({ onSelectType }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="space-y-3"
    >
      <Button onClick={() => onSelectType('student')} className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-4 focus:ring-pink-400">
        <UserCircle className="mr-3 h-6 w-6" /> Student Login
      </Button>
      <Button onClick={() => onSelectType('master')} className="w-full text-lg py-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-4 focus:ring-cyan-300">
        <ShieldCheck className="mr-3 h-6 w-6" /> Master Login
      </Button>
      <Button onClick={() => onSelectType('mhs')} className="w-full text-lg py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-4 focus:ring-orange-300">
        <Building className="mr-3 h-6 w-6" /> MHS Login
      </Button>
    </motion.div>
  );
};

export default LoginTypeSelection;