import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { loadData } from '@/lib/dataStore';
import { spiritualActivities, studentNames } from '@/lib/students'; 
import { Download, CalendarDays, ListFilter, UserCheck, Search } from 'lucide-react';

const SpiritualAttendanceReview = () => {
  const { toast } = useToast();
  const allAttendanceRecords = loadData('spiritualAttendance', {});
  const customLists = loadData('spiritualCustomLists', []);

  const [filterType, setFilterType] = useState('all-types'); 
  const [filterActivity, setFilterActivity] = useState('all-activities');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  
  const [activeMainTab, setActiveMainTab] = useState("reviewRecords");
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [totalAttendanceData, setTotalAttendanceData] = useState([]);


  const activityOptions = () => {
    let options = [];
    if (filterType === 'farl') options = spiritualActivities.farl;
    else if (filterType === 'sunnah') options = spiritualActivities.sunnah;
    else if (filterType === 'dhikr') options = spiritualActivities.dhikr;
    else if (filterType === 'custom') options = customLists.map(l => l.name);
    return options.filter(opt => opt && opt.trim() !== ""); 
  };

  const handleFilterRecords = () => {
    let records = Object.values(allAttendanceRecords);
    if (filterType && filterType !== 'all-types') {
      records = records.filter(r => r.type === filterType);
    }
    if (filterActivity && filterActivity !== 'all-activities') {
      records = records.filter(r => r.name === filterActivity);
    }
    if (filterStartDate) {
      records = records.filter(r => new Date(r.date) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      records = records.filter(r => new Date(r.date) <= new Date(filterEndDate));
    }
    setFilteredRecords(records.sort((a,b) => new Date(b.date) - new Date(a.date)));
    if(records.length === 0 && activeMainTab === "reviewRecords") {
        toast({title: "No Records", description: "No records found matching your criteria.", variant: "destructive"});
    }
  };

  useEffect(() => { // Auto-filter when filters change, for Total Attendance tab
    if(activeMainTab === "totalAttendance") {
      calculateTotalAttendance();
    }
  }, [filterType, filterActivity, filterStartDate, filterEndDate, activeMainTab]);


  const calculateTotalAttendance = () => {
    handleFilterRecords(); // Use the same filtering logic for records
    
    const studentTotals = {};
    studentNames.forEach(student => {
      studentTotals[student] = { present: 0, absent: 0, total: 0, percentage: 0 };
    });

    filteredRecords.forEach(record => {
      Object.entries(record.attendance).forEach(([student, present]) => {
        if (studentTotals[student]) {
          if (present) {
            studentTotals[student].present += 1;
          } else {
            studentTotals[student].absent += 1;
          }
          studentTotals[student].total += 1;
        }
      });
    });
    
    const totalsArray = Object.entries(studentTotals).map(([name, data]) => {
      const percentage = data.total > 0 ? (data.present / data.total * 100).toFixed(1) : 0;
      return { name, ...data, percentage };
    });

    setTotalAttendanceData(totalsArray);
    if(totalsArray.every(s => s.total === 0) && activeMainTab === "totalAttendance"){
         toast({title: "No Attendance Data", description: "No attendance data for the selected filters to calculate totals.", variant: "destructive"});
    }
  };


  const handleDownloadExcel = (isTotalAttendance = false) => {
    if (!isTotalAttendance && filteredRecords.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No record data to download. Please filter records first." });
      return;
    }
    if (isTotalAttendance && totalAttendanceData.filter(s => s.total > 0).length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No total attendance data to download. Please apply filters." });
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    if (isTotalAttendance) {
        csvContent += "Student,Present,Absent,Total Sessions,Percentage (%)\r\n";
        totalAttendanceData.filter(s => s.total > 0).forEach(student => {
            csvContent += `${student.name},${student.present},${student.absent},${student.total},${student.percentage}\r\n`;
        });
    } else {
        csvContent += "Date,Type,Activity,Batch,Student,Status,RecordedBy\r\n";
        filteredRecords.forEach(record => {
          Object.entries(record.attendance).forEach(([student, present]) => {
            csvContent += `${record.date},${record.type},${record.name},${record.batch || 'All'},${student},${present ? 'Present' : 'Absent'},${record.recordedBy}\r\n`;
          });
        });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${isTotalAttendance ? 'total' : 'detailed'}_spiritual_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: "Excel (CSV) download started. (Simulated)", className: "bg-green-500 text-white" });
  };
  
  const filteredStudentTotalData = totalAttendanceData.filter(student => student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()));

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary/90">Spiritual Attendance Review</CardTitle>
        <CardDescription>Filter records, view totals, and download attendance data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 h-[calc(100%-6rem)] flex flex-col">
        <div className="p-3 border rounded-lg bg-background/30 space-y-3">
          <h4 className="text-md font-semibold text-primary/80">Filter Options</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label htmlFor="filterType" className="text-xs">Type</Label>
              <Select value={filterType} onValueChange={(val) => { setFilterType(val); setFilterActivity('all-activities'); }}>
                <SelectTrigger id="filterType" className="h-9 text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="farl">Farl Prayer</SelectItem>
                  <SelectItem value="sunnah">Sunnah Prayer</SelectItem>
                  <SelectItem value="dhikr">Dhikr</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterActivity" className="text-xs">Activity</Label>
              <Select value={filterActivity} onValueChange={setFilterActivity} disabled={!filterType || filterType === 'all-types' || activityOptions().length === 0}>
                <SelectTrigger id="filterActivity" className="h-9 text-sm"><SelectValue placeholder="All Activities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-activities">All Activities</SelectItem>
                  {activityOptions().map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterStartDate" className="text-xs">Start Date</Label>
              <Input id="filterStartDate" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="h-9 text-sm"/>
            </div>
            <div>
              <Label htmlFor="filterEndDate" className="text-xs">End Date</Label>
              <Input id="filterEndDate" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="h-9 text-sm"/>
            </div>
          </div>
        </div>
        
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-2 bg-primary/5">
              <TabsTrigger value="reviewRecords" onClick={handleFilterRecords} className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ListFilter className="mr-2 h-4 w-4"/>Filtered Records</TabsTrigger>
              <TabsTrigger value="totalAttendance" onClick={calculateTotalAttendance} className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><UserCheck className="mr-2 h-4 w-4"/>Total Attendance</TabsTrigger>
            </TabsList>

            <TabsContent value="reviewRecords" className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-md font-semibold text-primary/80">Record Details ({filteredRecords.length})</h4>
                    <Button onClick={() => handleDownloadExcel(false)} size="sm" variant="outline" disabled={filteredRecords.length === 0}>
                        <Download className="mr-2 h-4 w-4"/>Download Detailed CSV
                    </Button>
                </div>
                <ScrollArea className="flex-grow border rounded-md p-2 bg-background/30">
                    {filteredRecords.length === 0 && <p className="text-center text-muted-foreground py-6">No records match your filter, or no filters applied.</p>}
                    <ul className="space-y-2 text-xs">
                        {filteredRecords.map((record, index) => (
                        <li key={`${record.date}-${record.name}-${index}`} className="p-2 bg-background/50 rounded-md">
                            <p className="font-semibold">{record.name} ({record.type}) - {new Date(record.date).toLocaleDateString()}</p>
                            <p className="text-muted-foreground text-xs">Batch: {record.batch || 'All Students'} | Recorded by: {record.recordedBy}</p>
                            <ul className="list-disc list-inside pl-3 mt-1">
                            {Object.entries(record.attendance).map(([student, present]) => (
                                <li key={student} className={present ? 'text-green-600' : 'text-red-600'}>
                                {student}: {present ? 'Present' : 'Absent'}
                                </li>
                            ))}
                            </ul>
                        </li>
                        ))}
                    </ul>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="totalAttendance" className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-1">
                    <Input 
                        type="text" 
                        placeholder="Search student..." 
                        value={studentSearchTerm} 
                        onChange={e => setStudentSearchTerm(e.target.value)} 
                        className="h-8 text-xs max-w-xs"
                    />
                    <Button onClick={() => handleDownloadExcel(true)} size="sm" variant="outline" disabled={totalAttendanceData.filter(s=>s.total>0).length === 0}>
                        <Download className="mr-2 h-4 w-4"/>Download Totals CSV
                    </Button>
                </div>
                <ScrollArea className="flex-grow border rounded-md p-2 bg-background/30">
                    {filteredStudentTotalData.filter(s => s.total > 0).length === 0 && <p className="text-center text-muted-foreground py-6">No total attendance data for applied filters or search term.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filteredStudentTotalData.filter(s => s.total > 0).map(student => (
                            <Card key={student.name} className="text-xs bg-background/50 p-2">
                                <p className="font-semibold">{student.name}</p>
                                <p>Present: <span className="text-green-600">{student.present}</span>, Absent: <span className="text-red-600">{student.absent}</span> (Total: {student.total})</p>
                                <p>Percentage: <span className="font-bold text-primary">{student.percentage}%</span></p>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpiritualAttendanceReview;