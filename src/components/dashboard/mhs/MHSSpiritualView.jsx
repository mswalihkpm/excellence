import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { studentNames, spiritualActivities } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { PlusCircle, Save, ListChecks, Users, CalendarDays, Download } from 'lucide-react';

const MHSSpiritualView = ({ user }) => {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const [attendanceRecords, setAttendanceRecords] = useState(loadData('spiritualAttendance', {}));
  const [customLists, setCustomLists] = useState(loadData('spiritualCustomLists', []));
  
  const [currentView, setCurrentView] = useState('main'); // main, prayer, dhikr, addCustom, takeAttendance
  const [activityType, setActivityType] = useState(''); // farl, sunnah, dhikr, custom
  const [activityName, setActivityName] = useState(''); // Zuhr, Witr, Asmaul Badr, Friday Halaqa
  const [selectedBatch, setSelectedBatch] = useState('all-students'); // Default to a non-empty value
  const [currentAttendance, setCurrentAttendance] = useState({}); // { [studentName]: true/false }
  const [newListName, setNewListName] = useState('');

  const batches = loadData('batches', []); 

  useEffect(() => {
    saveData('spiritualAttendance', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveData('spiritualCustomLists', customLists);
  }, [customLists]);

  const handleActivitySelect = (type, name) => {
    setActivityType(type);
    setActivityName(name);
    setCurrentView('takeAttendance');
    const batchKey = selectedBatch === 'all-students' ? 'all' : selectedBatch;
    const recordKey = `${today}_${type}_${name}_${batchKey}`;
    setCurrentAttendance(attendanceRecords[recordKey]?.attendance || {});
  };

  const handleStudentAttendanceChange = (studentName, isPresent) => {
    setCurrentAttendance(prev => ({ ...prev, [studentName]: isPresent }));
  };

  const handleSaveAttendance = () => {
    if (!activityName || !activityType) {
      toast({ variant: "destructive", title: "Error", description: "Activity details missing." });
      return;
    }
    const batchKey = selectedBatch === 'all-students' ? 'all' : selectedBatch;
    const recordKey = `${today}_${activityType}_${activityName}_${batchKey}`;
    setAttendanceRecords(prev => ({
      ...prev,
      [recordKey]: {
        date: today,
        type: activityType,
        name: activityName,
        batch: batchKey,
        attendance: currentAttendance,
        recordedBy: user.name,
      }
    }));
    toast({ title: "Attendance Saved", description: `Attendance for ${activityName} (${batchKey === 'all' ? 'All Students' : batchKey}) saved for ${today}.`, className: "bg-green-500 text-white" });
    setCurrentView(activityType === 'custom' ? 'addCustom' : activityType); 
    setCurrentAttendance({});
  };

  const handleAddCustomList = () => {
    if (!newListName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Custom list name cannot be empty." });
      return;
    }
    if (customLists.some(list => list.name === newListName.trim())) {
      toast({ variant: "destructive", title: "Error", description: "A custom list with this name already exists." });
      return;
    }
    setCustomLists(prev => [...prev, { id: Date.now().toString(), name: newListName.trim() }]);
    toast({ title: "Custom List Added", description: `"${newListName.trim()}" added.`, className: "bg-green-500 text-white" });
    setNewListName('');
  };
  
  const studentsForAttendance = selectedBatch === 'all-students' 
    ? studentNames 
    : batches.find(b => b.name === selectedBatch)?.students || [];

  const renderMainOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <Button onClick={() => setCurrentView('prayer')} className="h-20 text-lg bg-gradient-to-r from-sky-500 to-blue-600">Prayer</Button>
      <Button onClick={() => setCurrentView('dhikr')} className="h-20 text-lg bg-gradient-to-r from-emerald-500 to-green-600">Dhikr</Button>
      <Button onClick={() => setCurrentView('addCustom')} className="h-20 text-lg bg-gradient-to-r from-purple-500 to-indigo-600">Add Custom List</Button>
    </div>
  );

  const renderPrayerDhikrOptions = (type) => (
    <div className="p-4">
      <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-4">Back to Main</Button>
      <h3 className="text-xl font-semibold text-primary mb-3">{type.charAt(0).toUpperCase() + type.slice(1)} Options</h3>
      {type === 'prayer' && (
        <Tabs defaultValue="farl" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="farl">Farl</TabsTrigger>
            <TabsTrigger value="sunnah">Sunnah</TabsTrigger>
          </TabsList>
          <TabsContent value="farl" className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {spiritualActivities.farl.map(item => <Button key={item} onClick={() => handleActivitySelect('farl', item)} className="h-16">{item}</Button>)}
          </TabsContent>
          <TabsContent value="sunnah" className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {spiritualActivities.sunnah.map(item => <Button key={item} onClick={() => handleActivitySelect('sunnah', item)} className="h-16">{item}</Button>)}
          </TabsContent>
        </Tabs>
      )}
      {type === 'dhikr' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {spiritualActivities.dhikr.map(item => <Button key={item} onClick={() => handleActivitySelect('dhikr', item)} className="h-16">{item}</Button>)}
        </div>
      )}
    </div>
  );
  
  const renderAddCustomList = () => (
     <div className="p-4">
        <Button variant="outline" onClick={() => setCurrentView('main')} className="mb-4">Back to Main</Button>
        <h3 className="text-xl font-semibold text-primary mb-3">Custom Attendance Lists</h3>
        <div className="flex gap-2 mb-4">
            <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="New List Name (e.g., Friday Halaqa)" />
            <Button onClick={handleAddCustomList}><PlusCircle className="mr-2 h-4 w-4"/>Add List</Button>
        </div>
        <h4 className="text-lg font-medium text-muted-foreground mb-2">Existing Custom Lists:</h4>
        {customLists.length === 0 && <p className="text-sm text-center py-3">No custom lists created yet.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {customLists.map(list => (
                <Button key={list.id} variant="secondary" onClick={() => handleActivitySelect('custom', list.name)} className="h-16">{list.name}</Button>
            ))}
        </div>
     </div>
  );

  const renderTakeAttendance = () => (
    <div className="p-4">
      <Button variant="outline" onClick={() => setCurrentView(activityType === 'custom' ? 'addCustom' : activityType)} className="mb-4">Back to {activityType === 'custom' ? 'Custom Lists' : activityType.charAt(0).toUpperCase() + activityType.slice(1)}</Button>
      <h3 className="text-xl font-semibold text-primary mb-1">Take Attendance: {activityName}</h3>
      <p className="text-sm text-muted-foreground mb-3">Date: {today}</p>
      
      <div className="mb-4">
        <Label htmlFor="batchSelectSpiritual">Select Batch (Optional)</Label>
        <Select 
          value={selectedBatch} 
          onValueChange={(value) => {
            setSelectedBatch(value);
            const currentActivityType = activityType;
            const currentActivityName = activityName;
            const batchKey = value === 'all-students' ? 'all' : value;
            const recordKey = `${today}_${currentActivityType}_${currentActivityName}_${batchKey}`;
            setCurrentAttendance(attendanceRecords[recordKey]?.attendance || {});
          }}
        >
          <SelectTrigger id="batchSelectSpiritual"><SelectValue placeholder="All Students" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-students">All Students</SelectItem>
            {batches.filter(batch => batch.name && batch.name.trim() !== "").map(batch => <SelectItem key={batch.id || batch.name} value={batch.name}>{batch.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-28rem)] border rounded-md p-3 bg-background/30">
        {studentsForAttendance.length === 0 && <p className="text-center text-muted-foreground py-4">No students in selected batch or no students available.</p>}
        <ul className="space-y-2">
          {studentsForAttendance.map(studentName => (
            <li key={studentName} className="flex items-center justify-between p-2 rounded-md bg-background/50">
              <Label htmlFor={`att-${studentName}`} className="text-sm font-medium">{studentName}</Label>
              <Checkbox
                id={`att-${studentName}`}
                checked={!!currentAttendance[studentName]}
                onCheckedChange={(checked) => handleStudentAttendanceChange(studentName, checked)}
              />
            </li>
          ))}
        </ul>
      </ScrollArea>
      <Button onClick={handleSaveAttendance} className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <Save className="mr-2 h-5 w-5" /> Exit and Save Attendance
      </Button>
    </div>
  );


  return (
    <ScrollArea className="h-full">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg min-h-full">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">Spiritual Activities Tracking</CardTitle>
          <CardDescription>Manage attendance for prayers, dhikr, and custom spiritual activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentView === 'main' && renderMainOptions()}
          {(currentView === 'prayer' || currentView === 'dhikr') && renderPrayerDhikrOptions(currentView)}
          {currentView === 'addCustom' && renderAddCustomList()}
          {currentView === 'takeAttendance' && renderTakeAttendance()}
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default MHSSpiritualView;