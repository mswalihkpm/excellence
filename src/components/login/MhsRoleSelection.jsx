import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Briefcase, Users as UsersIcon } from 'lucide-react'; // Renamed Users to UsersIcon to avoid conflict

const MhsRoleSelection = ({ onSelectRole, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="space-y-3"
    >
      <h2 className="text-2xl font-semibold text-center text-primary">MHS Login - Select Role</h2>
      <Button onClick={() => onSelectRole('president')} className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg transition-all">
        <Crown className="mr-3 h-6 w-6" /> President
      </Button>
      <Button onClick={() => onSelectRole('secretary')} className="w-full text-lg py-6 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg transition-all">
        <Briefcase className="mr-3 h-6 w-6" /> Secretary
      </Button>
      <Button onClick={() => onSelectRole('other')} className="w-full text-lg py-6 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-lg transition-all">
        <UsersIcon className="mr-3 h-6 w-6" /> Others
      </Button>
      <Button variant="outline" onClick={onBack} className="w-full text-lg py-6 border-border hover:border-primary/70 focus:border-primary hover:bg-accent/50 transition-all">
        Back to Login Types
      </Button>
    </motion.div>
  );
};

export default MhsRoleSelection;