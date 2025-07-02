import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { mhsOtherSubRoles } from '@/lib/students';
import * as LucideIcons from 'lucide-react';

const MhsOtherSubRoleSelection = ({ onSelectSubRole, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="space-y-3"
    >
      <h2 className="text-2xl font-semibold text-center text-primary">MHS Others - Select Sub-Role</h2>
      <div className="grid grid-cols-2 gap-3">
        {mhsOtherSubRoles.map(subRole => {
          const IconComponent = LucideIcons[subRole.icon] || LucideIcons.Users;
          return (
            <Button 
              key={subRole.value} 
              onClick={() => onSelectSubRole(subRole.value)} 
              className="w-full text-md py-4 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white shadow-lg transition-all flex flex-col h-auto items-center"
            >
              <IconComponent className="mb-1 h-5 w-5" /> 
              {subRole.label}
            </Button>
          );
        })}
      </div>
      <Button variant="outline" onClick={onBack} className="w-full text-lg py-6 border-border hover:border-primary/70 focus:border-primary hover:bg-accent/50 transition-all mt-3">
        Back to MHS Roles
      </Button>
    </motion.div>
  );
};

export default MhsOtherSubRoleSelection;