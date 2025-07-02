import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { PlusCircle, Trash } from 'lucide-react';

const StudentLevelsManagement = () => {
  const { toast } = useToast();
  const [studentLevels, setStudentLevels] = useState(loadData('studentLevels', {}));
  const [selectedStudentForLevel, setSelectedStudentForLevel] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => { saveData('studentLevels', studentLevels); }, [studentLevels]);

  const addStudentPoints = () => {
    if (!selectedStudentForLevel || !subjectName.trim() || !points) {
      toast({ variant: "destructive", title: "Error", description: "Please select student, enter subject and points." });
      return;
    }
    const numPoints = parseInt(points, 10);
    if (isNaN(numPoints)) {
      toast({ variant: "destructive", title: "Error", description: "Points must be a number." });
      return;
    }

    setStudentLevels(prev => {
      const studentData = prev[selectedStudentForLevel] || { points: 0, rank: 'N/A', subjects: {} };
      const newSubjects = { ...studentData.subjects, [subjectName.trim()]: (studentData.subjects[subjectName.trim()] || 0) + numPoints };
      const totalPoints = Object.values(newSubjects).reduce((sum, p) => sum + p, 0);
      
      const updatedLevels = { ...prev, [selectedStudentForLevel]: { ...studentData, points: totalPoints, subjects: newSubjects } };
      
      const sortedStudents = Object.entries(updatedLevels)
        .map(([name, dataVal]) => ({ name, ...dataVal }))
        .sort((a, b) => b.points - a.points);
      
      sortedStudents.forEach((s, index) => {
        updatedLevels[s.name].rank = index + 1;
      });
      
      return updatedLevels;
    });

    toast({ title: "Success", description: `Points added for ${selectedStudentForLevel}.`, className: "bg-green-500 text-white" });
    setSubjectName('');
    setPoints('');
  };
  
  const resetStudentPoints = (studentName, subject) => {
     setStudentLevels(prev => {
      const studentData = prev[studentName];
      if (!studentData || !studentData.subjects[subject]) return prev;

      const newSubjects = { ...studentData.subjects };
      delete newSubjects[subject];
      
      const totalPoints = Object.values(newSubjects).reduce((sum, p) => sum + p, 0);
      const updatedLevels = { ...prev, [studentName]: { ...studentData, points: totalPoints, subjects: newSubjects } };

      const sortedStudents = Object.entries(updatedLevels)
        .map(([name, dataVal]) => ({ name, ...dataVal }))
        .sort((a, b) => b.points - a.points);
      
      sortedStudents.forEach((s, index) => {
        updatedLevels[s.name].rank = index + 1;
      });
      
      return updatedLevels;
    });
    toast({ title: "Success", description: `Points for ${subject} reset for ${studentName}.`, className: "bg-green-500 text-white" });
  };

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary/90">Manage Student Levels & Points</CardTitle>
        <CardDescription>Add or view points for students. Ranks are updated automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 h-[calc(100%-6rem)] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="space-y-0.5">
            <Label htmlFor="studentLevelSelectMaster" className="text-xs text-muted-foreground">Student</Label>
            <Select onValueChange={setSelectedStudentForLevel} value={selectedStudentForLevel}>
              <SelectTrigger id="studentLevelSelectMaster" className="text-sm"><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>{studentNames.map(name => <SelectItem key={name} value={name} className="text-sm">{name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="subjectNameMaster" className="text-xs text-muted-foreground">Subject Name</Label>
            <Input id="subjectNameMaster" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g., Mathematics Quiz" className="text-sm"/>
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="pointsMaster" className="text-xs text-muted-foreground">Points</Label>
            <Input id="pointsMaster" type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="e.g., 10" className="text-sm"/>
          </div>
        </div>
        <Button onClick={addStudentPoints} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">
          <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />Add Points
        </Button>

        <h3 className="text-md sm:text-lg font-semibold pt-2 text-primary/80">Current Student Standings</h3>
        <ScrollArea className="flex-grow pr-2">
          <div className="space-y-1.5">
          {Object.entries(studentLevels)
            .sort(([,a], [,b]) => (a.rank || Infinity) - (b.rank || Infinity) || b.points - a.points)
            .map(([name, data]) => (
            <Card key={name} className="p-2 sm:p-3 bg-background/50 dark:bg-background/40 text-xs sm:text-sm">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-semibold text-foreground">{name}</span>
                <div>
                  <span className="text-muted-foreground">Rank: </span><span className="font-bold text-primary">{data.rank || 'N/A'}</span>
                  <span className="text-muted-foreground ml-2 sm:ml-3">Total: </span><span className="font-bold text-primary">{data.points} pts</span>
                </div>
              </div>
              {Object.keys(data.subjects).length > 0 && (
                <ul className="list-disc list-inside pl-1 text-xs">
                  {Object.entries(data.subjects).map(([subj, pts]) => (
                    <li key={subj} className="text-muted-foreground flex justify-between items-center">
                      <span>{subj}: <span className="text-foreground/80">{pts} pts</span></span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 hover:text-red-600" onClick={() => resetStudentPoints(name, subj)}>
                        <Trash className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
          {Object.keys(studentLevels).length === 0 && <p className="text-center text-muted-foreground py-6">No student level data available.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StudentLevelsManagement;