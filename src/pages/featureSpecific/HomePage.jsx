import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { loadData, saveData } from '@/lib/dataStore';
import { generatePassword } from '@/lib/students';
import { Bell, CalendarDays, Info, ShoppingCart, MessageSquare, Users, KeyRound } from 'lucide-react';

const HomePage = ({ user }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [teams, setTeams] = useState(loadData('teamsData', []));

  useEffect(() => {
    let userNotifications = [];
    // Load general notifications for the user
    userNotifications = loadData(`userNotifications_${user.name}`, []);

    // Specific notifications for MHS Library/Kuthbkhana admins
    if (user.type === 'mhs' && (user.subRole === 'library' || user.subRole === 'kuthbkhana')) {
      const mhsLibNotifs = loadData(`mhsLibNotifications_${user.subRole}`, []);
      userNotifications = [...userNotifications, ...mhsLibNotifs];
    }
    
    // Specific notifications for MHS Seller
    if (user.type === 'mhs' && user.subRole === 'seller') {
        const sellerNotifs = loadData(`userNotifications_Seller Example`, []); // Assuming "Seller Example" is the key
        userNotifications = [...userNotifications, ...sellerNotifs];
    }

    // Student library messages
    if (user.type === 'student' || user.type === 'master') { // Masters might also borrow
      const libraryMessagesKey = `studentLibMessages_${user.name}`;
      const studentLibMsgs = loadData(libraryMessagesKey, []);
      if (studentLibMsgs.length > 0) {
          userNotifications = [...userNotifications, ...studentLibMsgs.map(m => ({ ...m, source: 'Library System' }))];
      }
    }
    
    setNotifications(userNotifications.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)));
  }, [user]);

  const handleUnlockPassword = (notification) => {
    const { userToUnlock, userType, userRole, userSubRole } = notification.recoveryData;
    const userKey = userToUnlock.toLowerCase().replace(/\s+/g, '');
    const newPassword = generatePassword(userToUnlock, userType, userSubRole); // Uses the standard generation logic
    
    const storedPasswords = loadData('userPasswords', {});
    const userPasswordKey = `${userType}_${userKey}${userSubRole ? `_${userSubRole}` : ''}`;
    storedPasswords[userPasswordKey] = newPassword;
    saveData('userPasswords', storedPasswords);

    // Clear login attempts for the unlocked user
    const loginAttempts = loadData('loginAttempts', {});
    delete loginAttempts[userKey];
    saveData('loginAttempts', loginAttempts);

    toast({ title: "Password Unlocked", description: `Password for ${userToUnlock} has been reset to default.`, className: "bg-green-500 text-white" });
    
    // Remove this specific notification
    const updatedNotifications = notifications.filter(n => n.id !== notification.id && n.recoveryData?.id !== notification.recoveryData?.id);
    setNotifications(updatedNotifications);
    saveData(`userNotifications_${user.name}`, updatedNotifications); // Save updated notifications for the master
  };


  return (
    <ScrollArea className="h-full p-1">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary/90">Welcome to Excellence, {user.name}!</CardTitle>
            <CardDescription>Your central hub for updates and quick access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-primary/80 flex items-center"><Bell className="mr-2 h-5 w-5"/>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] border rounded-md p-3 bg-background/30">
                  {notifications.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No new notifications.</p>
                  )}
                  <ul className="space-y-2">
                    {notifications.map((notif, index) => (
                      <li key={notif.id || index} className="p-2 bg-background/50 rounded-md shadow-sm">
                        <p className="text-sm font-medium text-foreground">{notif.text || notif.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.date || notif.timestamp).toLocaleString()}
                          {notif.source && ` - From: ${notif.source}`}
                        </p>
                        {notif.type === 'password_recovery' && user.name === 'NOUFAL ADANY' && (
                            <Button size="xs" onClick={() => handleUnlockPassword(notif)} className="mt-1 bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                <KeyRound className="mr-1 h-3 w-3"/> Unlock Password for {notif.recoveryData.userToUnlock}
                            </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            {user.type !== 'mhs' || user.role !== 'secretary' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-primary/80 flex items-center"><Users className="mr-2 h-5 w-5"/>Team Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[150px] border rounded-md p-3 bg-background/30">
                    {teams.length === 0 && <p className="text-center text-muted-foreground py-4">No teams created yet.</p>}
                    <ul className="space-y-2">
                      {teams.sort((a,b) => (b.points || 0) - (a.points || 0)).map(team => (
                        <li key={team.id} className="p-2 bg-background/50 rounded-md shadow-sm flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{team.name}</span>
                          <span className="text-sm font-semibold text-primary">{team.points || 0} Points</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : null}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAccessCard title="Upcoming Events" icon={CalendarDays} description="Check the circular for the latest event schedule." linkTo="/circular" />
              <QuickAccessCard title="Store Updates" icon={ShoppingCart} description="See new items and offers in the store." linkTo="/store" />
              <QuickAccessCard title="Postogram Feed" icon={Info} description="Catch up on the latest posts and announcements." linkTo="/postogram" />
              <QuickAccessCard title="Chat Groups" icon={MessageSquare} description="Join discussions and collaborate in chat groups." linkTo="/chatgroup" />
            </div>

          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

const QuickAccessCard = ({ title, icon: Icon, description, linkTo /* For future use with React Router */}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-md font-medium text-primary/85">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">{description}</p>
      {/* <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs mt-1">Go to {title.split(' ')[0]}</Button> */}
    </CardContent>
  </Card>
);

export default HomePage;