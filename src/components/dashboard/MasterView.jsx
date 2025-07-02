import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, Users, BarChart3, Award, ShieldCheck, Wallet, FileText } from 'lucide-react'; // Removed CalendarPlus

import StudentDetailsManagement from '@/components/dashboard/master/StudentDetailsManagement';
import BatchManagement from '@/components/dashboard/master/BatchManagement';
import StudentLevelsManagement from '@/components/dashboard/master/StudentLevelsManagement';
// import EventsManagement from '@/components/dashboard/master/EventsManagement'; // Removed
import CompetitionPointsManagement from '@/components/dashboard/master/CompetitionPointsManagement';
import SpiritualAttendanceReview from '@/components/dashboard/master/SpiritualAttendanceReview';
import UserManagement from '@/components/dashboard/master/UserManagement';
import StudentCashAccountTab from '@/components/dashboard/student/StudentCashAccountTab'; 
import ExamManagement from '@/components/dashboard/master/ExamManagement';


const MasterView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('studentDetails');

  const masterTabs = [
    { value: 'studentDetails', label: 'Student Details', icon: UserCog, component: <StudentDetailsManagement /> },
    { value: 'batchManagement', label: 'Batch Management', icon: Users, component: <BatchManagement /> },
    { value: 'studentLevels', label: 'Student Levels', icon: BarChart3, component: <StudentLevelsManagement /> },
    // { value: 'eventsManagement', label: 'Events Management', icon: CalendarPlus, component: <EventsManagement /> }, // Removed
    { value: 'competitionPoints', label: 'Competition Points', icon: Award, component: <CompetitionPointsManagement /> },
    { value: 'examManagement', label: 'Exam Management', icon: FileText, component: <ExamManagement /> },
    { value: 'spiritualReview', label: 'Spiritual Review', icon: ShieldCheck, component: <SpiritualAttendanceReview /> },
    { value: 'userManagement', label: 'User Management', icon: UserCog, component: <UserManagement userType="master" /> },
    { value: 'studentCashAccounts', label: 'Student Finances', icon: Wallet, component: <StudentCashAccountTab user={user} isMasterView={true} /> },
  ];

  return (
    <ScrollArea className="h-full p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 mb-3"> {/* Adjusted grid-cols */}
          {masterTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
              <tab.icon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {masterTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </ScrollArea>
  );
};

export default MasterView;