import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import LoginTypeSelection from '@/components/login/LoginTypeSelection';
import MhsRoleSelection from '@/components/login/MhsRoleSelection';
import MhsOtherSubRoleSelection from '@/components/login/MhsOtherSubRoleSelection';
import UserCredentialsForm from '@/components/login/UserCredentialsForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onLoginFail, loginAttempts }) => {
  const [loginType, setLoginType] = useState(null); // 'student', 'master', 'mhs'
  const [mhsRole, setMhsRole] = useState(null); // 'president', 'secretary', 'other'
  const [mhsSubRole, setMhsSubRole] = useState(null); // Specific role if mhsRole is 'other'
  
  const resetSelection = () => {
    setLoginType(null);
    setMhsRole(null);
    setMhsSubRole(null);
  };

  const currentStep = () => {
    if (!loginType) return 'type';
    if (loginType === 'mhs' && !mhsRole) return 'mhsRole';
    if (loginType === 'mhs' && mhsRole === 'other' && !mhsSubRole) return 'mhsSubRole';
    return 'credentials';
  };

  const renderStep = () => {
    const step = currentStep();
    switch (step) {
      case 'type':
        return <LoginTypeSelection onSelectType={setLoginType} />;
      case 'mhsRole':
        return <MhsRoleSelection onSelectRole={setMhsRole} />;
      case 'mhsSubRole':
        return <MhsOtherSubRoleSelection onSelectSubRole={setMhsSubRole} />;
      case 'credentials':
        return (
          <UserCredentialsForm
            userType={loginType}
            role={mhsRole}
            subRole={mhsSubRole}
            onLoginSuccess={onLoginSuccess}
            onLoginFail={onLoginFail}
            loginAttempts={loginAttempts}
          />
        );
      default:
        return <p>Error in login flow.</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-6 sm:p-8 bg-card/70 dark:bg-card/60 backdrop-blur-lg shadow-2xl rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h1 
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-400 to-orange-400 select-none"
          style={{fontFamily:"'Orbitron', sans-serif"}}
        >
          Excellence
        </motion.h1>
        {currentStep() !== 'type' && (
          <Button variant="ghost" size="sm" onClick={resetSelection} className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1 select-none" style={{fontFamily:"'Nunito', sans-serif"}}>An Excellent Study Companion</p>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep()}
          initial={{ opacity: 0, x: currentStep() === 'type' ? 0 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LoginPage;