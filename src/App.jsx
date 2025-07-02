import React, { useState, useEffect } from 'react';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IntroScreen from '@/components/IntroScreen';
import UserIntroScreen from '@/components/UserIntroScreen'; 
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatePresence } from 'framer-motion';
import { loadData, saveData } from '@/lib/dataStore';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showAppIntro, setShowAppIntro] = useState(true);
  const [showUserIntro, setShowUserIntro] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(loadData('loginAttempts', {}));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const appIntroTimer = setTimeout(() => {
      setShowAppIntro(false);
    }, 3000); 
    return () => clearTimeout(appIntroTimer);
  }, []);

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    
    setLoginAttempts(prev => {
      const updatedAttempts = { ...prev };
      delete updatedAttempts[user.name.toLowerCase().replace(/\s+/g, '')];
      saveData('loginAttempts', updatedAttempts);
      return updatedAttempts;
    });

    let photo = null;
    if (user.type === 'student') {
      const studentDetails = loadData('studentDetails', {});
      photo = studentDetails[user.name]?.photo || null;
    } else if (user.type === 'master') {
      const masterDetails = loadData('masterDetails', {});
      photo = masterDetails[user.name]?.photo || null;
    } else if (user.type === 'mhs') {
      const mhsUserDetails = loadData('mhsUserDetails', {});
      photo = mhsUserDetails[user.name]?.photo || null;
    }
    setUserPhoto(photo);
    setShowUserIntro(true); 
    
    const userIntroTimer = setTimeout(() => {
      setShowUserIntro(false);
    }, 2000); // Changed from 4000 to 2000
    return () => clearTimeout(userIntroTimer);
  };
  
  const handleLoginFail = (username) => {
    const userKey = username.toLowerCase().replace(/\s+/g, '');
    setLoginAttempts(prev => {
      const newCount = (prev[userKey] || 0) + 1;
      const updatedAttempts = { ...prev, [userKey]: newCount };
      saveData('loginAttempts', updatedAttempts);
      return updatedAttempts;
    });
  };


  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('loggedInUser');
    setShowUserIntro(false); 
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);
      let photo = null;
      if (parsedUser.type === 'student') {
        const studentDetails = loadData('studentDetails', {});
        photo = studentDetails[parsedUser.name]?.photo || null;
      } else if (parsedUser.type === 'master') {
        const masterDetails = loadData('masterDetails', {});
        photo = masterDetails[parsedUser.name]?.photo || null;
      } else if (parsedUser.type === 'mhs') {
        const mhsUserDetails = loadData('mhsUserDetails', {});
        photo = mhsUserDetails[parsedUser.name]?.photo || null;
      }
      setUserPhoto(photo);
    }
  }, []);
  
  const renderContent = () => {
    if (showAppIntro) {
      return <IntroScreen key="appIntro" />;
    }
    if (showUserIntro && loggedInUser) {
      return <UserIntroScreen key="userIntro" userName={loggedInUser.name} userPhoto={userPhoto} />;
    }
    if (loggedInUser) {
      return <DashboardPage key="dashboard" user={loggedInUser} onLogout={handleLogout} toggleTheme={toggleTheme} currentTheme={theme} />;
    }
    return <LoginPage key="login" onLoginSuccess={handleLoginSuccess} onLoginFail={handleLoginFail} loginAttempts={loginAttempts} />;
  };

  return (
    <ThemeProvider defaultTheme={theme} storageKey="excellence-ui-theme">
      <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden relative ${ showAppIntro || showUserIntro ? 'bg-slate-900' : (loggedInUser ? 'animated-gradient-dashboard' : 'animated-gradient-login') }`}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
        {!showAppIntro && !showUserIntro && <Toaster />}
      </div>
    </ThemeProvider>
  );
}

export default App;