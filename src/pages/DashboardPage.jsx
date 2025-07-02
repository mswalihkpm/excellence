
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Home, Users, Image as ImageIcon, MessageSquare, ShoppingBag, CalendarCheck2, Menu, X, UserCog, BarChart3, Award, FileText, ShieldCheck, Wallet } from 'lucide-react';

import SettingsMenu from '@/components/dashboard/SettingsMenu';
import ChangePasswordDialog from '@/components/dashboard/ChangePasswordDialog';

import StudentView from '@/components/dashboard/StudentView';
// MasterView tabs are now part of DashboardPage for Masters
import StudentDetailsManagement from '@/components/dashboard/master/StudentDetailsManagement';
import BatchManagement from '@/components/dashboard/master/BatchManagement';
import StudentLevelsManagement from '@/components/dashboard/master/StudentLevelsManagement';
import CompetitionPointsManagement from '@/components/dashboard/master/CompetitionPointsManagement';
import ExamManagement from '@/components/dashboard/master/ExamManagement';
import SpiritualAttendanceReview from '@/components/dashboard/master/SpiritualAttendanceReview';
import UserManagement from '@/components/dashboard/master/UserManagement';
import StudentCashAccountTab from '@/components/dashboard/student/StudentCashAccountTab'; 

import MHSView from '@/components/dashboard/MHSView';
import MHSAccounterView from '@/components/dashboard/mhs/MHSAccounterView';
import MHSSellerComputerView from '@/components/dashboard/mhs/MHSSellerComputerView';
import MHSLibraryAdminView from '@/components/dashboard/mhs/MHSLibraryAdminView';
import MHSSpiritualView from '@/components/dashboard/mhs/MHSSpiritualView';

import HomePage from '@/pages/featureSpecific/HomePage';
import PostogramPage from '@/pages/featureSpecific/PostogramPage';
import ChatGroupPage from '@/pages/featureSpecific/ChatGroupPage';
import StorePage from '@/pages/featureSpecific/StorePage';
import CircularPage from '@/pages/featureSpecific/CircularPage';
import TeamManagementPage from '@/pages/featureSpecific/TeamManagementPage';

const DashboardPage = ({ user, onLogout, toggleTheme, currentTheme }) => {
  const { toast } = useToast();
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [activeView, setActiveView] = useState('home'); 
  const [activeMasterTab, setActiveMasterTab] = useState('studentDetails');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const masterDashboardTabs = [
    { id: 'studentDetails', label: 'Student Details', icon: UserCog, component: <StudentDetailsManagement user={user} /> },
    { id: 'batchManagement', label: 'Batch Management', icon: Users, component: <BatchManagement /> },
    { id: 'studentLevels', label: 'Student Levels', icon: BarChart3, component: <StudentLevelsManagement /> },
    { id: 'competitionPoints', label: 'Competition Points', icon: Award, component: <CompetitionPointsManagement /> },
    { id: 'examManagement', label: 'Exam Management', icon: FileText, component: <ExamManagement /> },
    { id: 'spiritualReview', label: 'Spiritual Review', icon: ShieldCheck, component: <SpiritualAttendanceReview /> },
    { id: 'userManagement', label: 'User Management', icon: UserCog, component: <UserManagement masterUser={user} /> },
    { id: 'studentFinances', label: 'Student Finances', icon: Wallet, component: <StudentCashAccountTab user={user} isMasterView={true} /> },
  ];

  const renderUserSpecificDashboardContent = () => {
    if (user.type === 'master') {
      const currentTab = masterDashboardTabs.find(tab => tab.id === activeMasterTab);
      return currentTab ? currentTab.component : <p>Select a tab</p>;
    }
    // Other user types' dashboard content
    switch (user.type) {
      case 'student':
        return <StudentView user={user} />;
      case 'mhs':
        if (user.role === 'other') {
          switch (user.subRole) {
            case 'accounter': return <MHSAccounterView user={user} />;
            case 'seller':
            case 'computer': return <MHSSellerComputerView user={user} department={user.subRole} />;
            case 'library':
            case 'kuthbkhana': return <MHSLibraryAdminView user={user} libraryType={user.subRole} />;
            case 'spiritual': return <MHSSpiritualView user={user} />;
            default: return <MHSView user={user} />; 
          }
        }
        return <MHSView user={user} />; // For President, Secretary
      default:
        return <p>Invalid user type.</p>;
    }
  };

  const renderActiveViewContent = () => {
    switch (activeView) {
      case 'home': return <HomePage user={user} />;
      case 'dashboard': return renderUserSpecificDashboardContent();
      case 'postogram': return <PostogramPage user={user} />;
      case 'chatgroup': return <ChatGroupPage user={user} />;
      case 'store': return <StorePage user={user} />;
      case 'circular': return <CircularPage user={user} />;
      case 'teams': return <TeamManagementPage user={user} />;
      default: return <HomePage user={user} />;
    }
  };

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'postogram', label: 'Postogram', icon: ImageIcon },
    { id: 'chatgroup', label: 'ChatGroup', icon: MessageSquare },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'circular', label: 'Circular', icon: CalendarCheck2 },
  ];

  const NavItem = ({ item, isSubItem = false }) => (
    <Button
      variant={activeView === item.id || (activeView === 'dashboard' && user.type === 'master' && activeMasterTab === item.id) ? "secondary" : "ghost"}
      className={`w-full justify-start text-sm h-10 ${isSubItem ? 'pl-8 text-xs h-9' : 'h-11'} ${activeView === item.id || (activeView === 'dashboard' && user.type === 'master' && activeMasterTab === item.id) ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}`}
      onClick={() => { 
        if (user.type === 'master' && mainNavItems.find(nav => nav.id === 'dashboard') && masterDashboardTabs.find(tab => tab.id === item.id)) {
          setActiveView('dashboard');
          setActiveMasterTab(item.id);
        } else {
          setActiveView(item.id);
        }
        setIsMobileMenuOpen(false); 
      }}
    >
      <item.icon className="mr-3 h-4 w-4" />
      {item.label}
    </Button>
  );
  
  const handleAppNameClick = (e) => {
    e.preventDefault(); // Prevent default link behavior if it was an anchor
    setActiveView('home');
    setIsMobileMenuOpen(false);
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="w-full h-screen max-h-[1000px] max-w-full md:max-w-7xl flex flex-col bg-transparent md:rounded-xl md:shadow-2xl" 
    >
      <header className="p-3 sm:p-4 bg-card/80 dark:bg-card/70 backdrop-blur-lg shadow-lg md:rounded-t-xl flex justify-between items-center border-b border-border/50 shrink-0">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <motion.button
            onClick={handleAppNameClick}
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}
            className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-400 to-orange-400 select-none cursor-pointer hover:opacity-80"
            style={{fontFamily:"'Orbitron', sans-serif"}}
          >
            Excellence
          </motion.button>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline select-none" style={{fontFamily:"'Nunito', sans-serif"}}>
            <strong className="text-foreground">{user.name}</strong> ({user.type}{user.role ? ` - ${user.role}` : ''}{user.subRole ? ` (${user.subRole})` : ''})
          </span>
          <SettingsMenu
            onLogout={onLogout}
            toggleTheme={toggleTheme}
            currentTheme={currentTheme}
            onShowChangePassword={() => setShowChangePasswordDialog(true)}
          />
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden md:rounded-b-xl">
        <nav className="w-52 md:w-56 border-r border-border/50 p-3 space-y-1 bg-background/40 dark:bg-background/30 backdrop-blur-sm hidden md:block shrink-0">
          {mainNavItems.map(item => (
            <React.Fragment key={item.id}>
              <NavItem item={item} />
              {item.id === 'dashboard' && user.type === 'master' && activeView === 'dashboard' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-2 space-y-0.5 mt-0.5">
                  {masterDashboardTabs.map(subItem => <NavItem key={subItem.id} item={subItem} isSubItem={true} />)}
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-64 bg-background/95 backdrop-blur-md z-40 p-4 space-y-1 shadow-xl md:hidden"
            >
              <div className="flex justify-between items-center mb-3">
                 <span className="text-lg font-semibold text-primary" style={{fontFamily:"'Orbitron', sans-serif"}}>Menu</span>
                 <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                 </Button>
              </div>
              {mainNavItems.map(item => (
                <React.Fragment key={item.id}>
                  <NavItem item={item} />
                  {item.id === 'dashboard' && user.type === 'master' && activeView === 'dashboard' && (
                     <div className="pl-2 space-y-0.5 mt-0.5">
                        {masterDashboardTabs.map(subItem => <NavItem key={subItem.id} item={subItem} isSubItem={true} />)}
                     </div>
                  )}
                </React.Fragment>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>


        <main className="flex-grow p-1 sm:p-2 md:p-4 bg-card/60 dark:bg-card/50 backdrop-blur-md overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView === 'dashboard' && user.type === 'master' ? activeMasterTab : activeView} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {renderActiveViewContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ChangePasswordDialog
        user={user}
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
    </motion.div>
  );
};

export default DashboardPage;
