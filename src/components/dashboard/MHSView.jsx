import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, CalendarPlus, Award, Users, FilePlus, ShieldCheck } from 'lucide-react';

import UserManagement from '@/components/dashboard/master/UserManagement'; // Re-use for MHS
import EventsManagement from '@/components/dashboard/master/EventsManagement';
import StudentLevelsManagement from '@/components/dashboard/master/StudentLevelsManagement';
import CompetitionPointsManagement from '@/components/dashboard/master/CompetitionPointsManagement';
import CreateSubscription from '@/components/dashboard/mhs/CreateSubscription';
import TeamManagementPage from '@/pages/featureSpecific/TeamManagementPage'; // Secretary can manage teams here

const MHSView = ({ user }) => {
  const [activeTab, setActiveTab] = useState(user.role === 'president' ? 'userManagement' : 'eventsManagement'); // Default for secretary

  const presidentTabs = [
    { value: 'userManagement', label: 'User Management', icon: UserPlus, component: <UserManagement userType="mhsPresident" /> },
    { value: 'createSubscription', label: 'Create Subscription', icon: FilePlus, component: <CreateSubscription /> },
  ];

  const secretaryTabs = [
    { value: 'eventsManagement', label: 'Events Management', icon: CalendarPlus, component: <EventsManagement /> },
    { value: 'studentLevels', label: 'Student Levels', icon: Award, component: <StudentLevelsManagement /> },
    { value: 'competitionPoints', label: 'Competition Points', icon: Users, component: <CompetitionPointsManagement /> },
    { value: 'teamManagement', label: 'Team Management', icon: ShieldCheck, component: <TeamManagementPage user={user} /> },
  ];
  
  const tabsToShow = user.role === 'president' ? presidentTabs : (user.role === 'secretary' ? secretaryTabs : []);

  if (tabsToShow.length === 0 && user.role !== 'other') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>MHS Dashboard</CardTitle>
          <CardDescription>Welcome, {user.name}. No specific actions available for your role yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (user.role === 'other' && !user.subRole) {
     return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>MHS Staff Dashboard</CardTitle>
          <CardDescription>Welcome, {user.name}. Please select a sub-role if applicable or contact admin.</CardDescription>
        </CardHeader>
      </Card>
    );
  }


  return (
    <ScrollArea className="h-full p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-${tabsToShow.length} mb-3`}>
          {tabsToShow.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <tab.icon className="mr-2 h-4 w-4 hidden md:inline-block" />{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabsToShow.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </ScrollArea>
  );
};

export default MHSView;