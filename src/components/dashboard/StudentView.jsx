import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, BookOpen, Library as LibraryIcon } from 'lucide-react';
import { loadData } from '@/lib/dataStore';
import { initialBookData } from '@/lib/students';

import StudentDashboardTab from '@/components/dashboard/student/StudentDashboardTab';
import StudentCashAccountTab from '@/components/dashboard/student/StudentCashAccountTab';
import StudentLibraryTab from '@/components/dashboard/student/StudentLibraryTab';

const StudentView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const studentLibMessages = loadData(`studentLibMessages_${user.name}`, []);
  const hasLibraryNotifications = studentLibMessages.some(msg => new Date(msg.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  const NavItem = ({ value, label, icon: Icon, hasNotification }) => (
    <Button
      variant={activeTab === value ? "secondary" : "ghost"}
      className={`w-full justify-start text-sm h-11 relative ${activeTab === value ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'}`}
      onClick={() => setActiveTab(value)}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
      {hasNotification && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>}
    </Button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboardTab user={user} />;
      case 'cashAccount':
        return <StudentCashAccountTab user={user} />;
      case 'library':
        return <StudentLibraryTab user={user} libraryType="library" initialBooks={initialBookData} messages={studentLibMessages} />;
      case 'kuthbkhana':
        return <StudentLibraryTab user={user} libraryType="kuthbkhana" initialBooks={initialBookData.filter(b => b.isArabic)} messages={studentLibMessages} />;
      default:
        return <p>Section not found.</p>;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <nav className="w-52 md:w-56 border-r border-border/50 p-3 space-y-1.5 bg-background/30 dark:bg-background/20 hidden sm:block">
        <NavItem value="dashboard" label="Dashboard" icon={LayoutDashboard} />
        <NavItem value="cashAccount" label="Cash Account" icon={Wallet} />
        <NavItem value="library" label="Library" icon={LibraryIcon} hasNotification={hasLibraryNotifications && studentLibMessages.some(m => m.type === 'library' || !m.type)} />
        <NavItem value="kuthbkhana" label="Kuthbkhana" icon={BookOpen} hasNotification={hasLibraryNotifications && studentLibMessages.some(m => m.type === 'kuthbkhana')} />
      </nav>
      
      <div className="sm:hidden p-2 mb-2 border-b border-border/50">
        <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="cashAccount">Cash Account</SelectItem>
                <SelectItem value="library">Library {hasLibraryNotifications && studentLibMessages.some(m => m.type === 'library' || !m.type) && "(New)"}</SelectItem>
                <SelectItem value="kuthbkhana">Kuthbkhana {hasLibraryNotifications && studentLibMessages.some(m => m.type === 'kuthbkhana') && "(New)"}</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-grow p-2 sm:p-4 h-full">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </ScrollArea>
    </div>
  );
};

export default StudentView;