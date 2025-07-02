import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { loadData, saveData, studentDetailFields, initialStudentData } from '@/lib/dataStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadCloud } from 'lucide-react';

const StudentDashboardTab = ({ user }) => {
  const { toast } = useToast();
  const [studentDetails, setStudentDetails] = useState(loadData('studentDetails', {}));
  const [myDetails, setMyDetails] = useState(studentDetails[user.name] || initialStudentData());
  const [studentPhoto, setStudentPhoto] = useState(myDetails.photo || null);

  useEffect(() => {
    const allDetails = loadData('studentDetails', {});
    setMyDetails(allDetails[user.name] || initialStudentData());
    setStudentPhoto((allDetails[user.name] || {}).photo || null);
  }, [user.name]);
  
  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result);
        const updatedDetails = { ...studentDetails, [user.name]: { ...(studentDetails[user.name] || initialStudentData()), photo: reader.result } };
        setStudentDetails(updatedDetails);
        saveData('studentDetails', updatedDetails);
        toast({ title: "Photo Uploaded", description: "Your profile photo has been updated.", className: "bg-green-500 text-white" });
      };
      reader.readAsDataURL(file);
    }
  };

  const userLevelData = loadData('studentLevels', {})[user.name] || { level: 'Beginner', points: 0, subjectPoints: {} };
  const upcomingEvents = loadData('circularEvents', []).filter(event => new Date(event.date) >= new Date()).sort((a,b) => new Date(a.date) - new Date(b.date));
  const competitionPointsList = loadData('competitionPoints', []);


  return (
    <ScrollArea className="h-full p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 shadow-lg bg-card/80 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-2 border-4 border-primary/30 shadow-md">
              <AvatarImage src={studentPhoto || '/placeholder-avatar.png'} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl text-primary/90">{user.name}</CardTitle>
            <CardDescription>{myDetails.class || 'Class Not Set'} - Reg No: {myDetails.registrationNumber || 'N/A'}</CardDescription>
            <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
              <label htmlFor="studentPhotoUploadSelf" className="cursor-pointer">
                <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload Photo
                <input id="studentPhotoUploadSelf" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            <h4 className="font-semibold mb-1 text-muted-foreground">Details:</h4>
            {studentDetailFields.slice(0, 7).map(field => ( // Show a subset of fields or all scrollable
              (myDetails[field.id] || field.id === 'photo') && field.id !== 'photo' && (
                <p key={field.id} className="mb-0.5">
                  <strong className="text-foreground/80">{field.label}:</strong> {myDetails[field.id]}
                </p>
              )
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg bg-card/80 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary/90">Academic & Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-md bg-background/30">
              <h4 className="font-semibold text-md text-foreground/90">My Level & Points</h4>
              <p>Current Level: <span className="font-bold text-primary">{userLevelData.level}</span></p>
              <p>Total Points: <span className="font-bold text-primary">{userLevelData.points}</span></p>
              {Object.keys(userLevelData.subjectPoints).length > 0 && (
                <ul className="text-xs mt-1 list-disc list-inside">
                  {Object.entries(userLevelData.subjectPoints).map(([subject, points]) => (
                    <li key={subject}>{subject}: {points} points</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border rounded-md bg-background/30">
              <h4 className="font-semibold text-md text-foreground/90">Upcoming Events ({upcomingEvents.slice(0,3).length})</h4>
              {upcomingEvents.length === 0 && <p className="text-xs text-muted-foreground">No upcoming events.</p>}
              <ul className="text-xs space-y-0.5 mt-1">
                {upcomingEvents.slice(0, 3).map(event => (
                  <li key={event.id} className="truncate">
                    <strong className="text-foreground/80">{new Date(event.date).toLocaleDateString()}:</strong> {event.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 border rounded-md bg-background/30">
              <h4 className="font-semibold text-md text-foreground/90">Competition Points Structure</h4>
              {competitionPointsList.length === 0 && <p className="text-xs text-muted-foreground">No competition points defined yet.</p>}
              <ScrollArea className="h-[100px] text-xs mt-1">
                <ul className="space-y-0.5 pr-2">
                  {competitionPointsList.map(comp => (
                    <li key={comp.id} className="flex justify-between">
                      <span>{comp.name}:</span> 
                      <span className="font-semibold text-primary/90">{comp.points} points</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default StudentDashboardTab;