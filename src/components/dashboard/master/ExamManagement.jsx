
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { PlusCircle, Edit3, Trash2, ListChecks, BarChart2, Search, Users } from 'lucide-react';

const ExamManagement = () => {
  const { toast } = useToast();
  const [exams, setExams] = useState(loadData('examsData', [])); 
  const [examResults, setExamResults] = useState(loadData('examResultsData', {})); 
  const [batches, setBatches] = useState(loadData('batches', []));
  
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [currentExam, setCurrentExam] = useState({ name: '', subject: '', date: '', totalMarks: '', batchId: '' });

  const [showAssignMarksDialog, setShowAssignMarksDialog] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);
  const [studentMarks, setStudentMarks] = useState({}); 

  const [activeTab, setActiveTab] = useState("manageExams");
  const [studentSearchTerm, setStudentSearchTerm] = useState('');


  useEffect(() => { saveData('examsData', exams); }, [exams]);
  useEffect(() => { saveData('examResultsData', examResults); }, [examResults]);

  const handleExamInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExam(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExamBatchChange = (value) => {
    setCurrentExam(prev => ({ ...prev, batchId: value }));
  };

  const handleSaveExam = () => {
    if (!currentExam.name || !currentExam.subject || !currentExam.date || !currentExam.totalMarks || !currentExam.batchId) {
      toast({ variant: "destructive", title: "Error", description: "All exam fields, including batch, are required." });
      return;
    }
    const totalMarksNum = parseInt(currentExam.totalMarks, 10);
    if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Total marks must be a positive number."});
      return;
    }

    if (editingExam) {
      setExams(prevExams => prevExams.map(ex => ex.id === editingExam.id ? { ...editingExam, ...currentExam, totalMarks: totalMarksNum } : ex));
      toast({ title: "Exam Updated", description: `${currentExam.name} updated.`, className: "bg-green-500 text-white" });
    } else {
      const newExam = { ...currentExam, totalMarks: totalMarksNum, id: Date.now().toString() };
      setExams(prevExams => [...prevExams, newExam]);
      setExamResults(prevResults => ({ ...prevResults, [newExam.id]: {} })); 
      toast({ title: "Exam Created", description: `${currentExam.name} created.`, className: "bg-green-500 text-white" });
    }
    resetExamForm();
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setCurrentExam({ name: exam.name, subject: exam.subject, date: exam.date, totalMarks: exam.totalMarks.toString(), batchId: exam.batchId || '' });
    setShowCreateExamDialog(true);
  };

  const handleDeleteExam = (examId) => {
    setExams(prevExams => prevExams.filter(ex => ex.id !== examId));
    setExamResults(prevResults => {
      const updatedResults = { ...prevResults };
      delete updatedResults[examId];
      return updatedResults;
    });
    toast({ title: "Exam Deleted", description: "Exam and its results deleted.", className: "bg-red-500 text-white" });
  };
  
  const resetExamForm = () => {
    setShowCreateExamDialog(false);
    setEditingExam(null);
    setCurrentExam({ name: '', subject: '', date: '', totalMarks: '', batchId: '' });
  };

  const openAssignMarksDialog = (exam) => {
    setSelectedExamForMarks(exam);
    setStudentMarks(examResults[exam.id] || {});
    setShowAssignMarksDialog(true);
    setStudentSearchTerm(''); 
  };

  const handleStudentMarkChange = (studentName, marks) => {
    setStudentMarks(prev => ({ ...prev, [studentName]: marks }));
  };

  const handleSaveStudentMarks = () => {
    if (!selectedExamForMarks) return;
    const updatedExamResults = { ...examResults, [selectedExamForMarks.id]: studentMarks };
    setExamResults(updatedExamResults);
    toast({ title: "Marks Saved", description: `Marks for ${selectedExamForMarks.name} saved.`, className: "bg-green-500 text-white" });
    setShowAssignMarksDialog(false);
    setStudentSearchTerm(''); 
  };
  
  const getStudentsForSelectedExamBatch = () => {
    if (!selectedExamForMarks || !selectedExamForMarks.batchId) return studentNames; // Default to all if no batch
    const batch = batches.find(b => b.id === selectedExamForMarks.batchId);
    return batch ? batch.students : studentNames; // Fallback to all if batch not found
  };

  const filteredStudentNamesForMarks = getStudentsForSelectedExamBatch().filter(name => name.toLowerCase().includes(studentSearchTerm.toLowerCase()));


  return (
    <ScrollArea className="h-full p-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-3 bg-primary/10">
          <TabsTrigger value="manageExams" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ListChecks className="mr-2 h-4 w-4"/>Manage Exams</TabsTrigger>
          <TabsTrigger value="viewResults" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BarChart2 className="mr-2 h-4 w-4"/>View Results</TabsTrigger>
        </TabsList>

        <TabsContent value="manageExams">
          <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-primary/90">Exam Creation & Management</CardTitle>
                <Button size="sm" onClick={() => { resetExamForm(); setShowCreateExamDialog(true); }} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <PlusCircle className="mr-2 h-4 w-4"/>Create New Exam
                </Button>
              </div>
              <CardDescription>Define exams, set subjects, dates, total marks, and assign to batches.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-24rem)]">
                {exams.length === 0 && <p className="text-center text-muted-foreground py-8">No exams created yet.</p>}
                <ul className="space-y-3 pr-2">
                  {exams.map(exam => {
                    const batchName = batches.find(b => b.id === exam.batchId)?.name || 'N/A';
                    return (
                      <li key={exam.id} className="p-3 bg-background/50 rounded-md shadow-sm border border-border/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-md text-foreground">{exam.name}</h4>
                            <p className="text-xs text-muted-foreground">Subject: {exam.subject} | Batch: {batchName}</p>
                            <p className="text-xs text-muted-foreground">Date: {new Date(exam.date).toLocaleDateString()} | Total Marks: {exam.totalMarks}</p>
                          </div>
                          <div className="flex space-x-1 shrink-0">
                            <Button variant="outline" size="xs" onClick={() => openAssignMarksDialog(exam)} className="h-6 px-1.5 text-xs">Assign Marks</Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditExam(exam)} className="text-blue-500 hover:text-blue-600 h-6 w-6"><Edit3 className="h-3.5 w-3.5"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExam(exam.id)} className="text-red-500 hover:text-red-600 h-6 w-6"><Trash2 className="h-3.5 w-3.5"/></Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewResults">
           <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
             <CardHeader>
               <CardTitle className="text-xl text-primary/90">Exam Results Overview</CardTitle>
               <CardDescription>View student marks for each exam.</CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[calc(100vh-22rem)]">
                 {exams.length === 0 && <p className="text-center text-muted-foreground py-8">No exams available to show results.</p>}
                 {exams.map(exam => {
                   const batchName = batches.find(b => b.id === exam.batchId)?.name || 'N/A';
                   return (
                     <div key={`results-${exam.id}`} className="mb-4 p-3 border rounded-md bg-background/40">
                       <h4 className="font-semibold text-md text-primary mb-1">{exam.name} - {exam.subject} (Batch: {batchName}, Total: {exam.totalMarks})</h4>
                       <ul className="text-sm space-y-0.5">
                         {Object.entries(examResults[exam.id] || {}).map(([student, marks]) => (
                           <li key={student} className="flex justify-between">
                             <span>{student}:</span>
                             <span>{marks} / {exam.totalMarks}</span>
                           </li>
                         ))}
                         {Object.keys(examResults[exam.id] || {}).length === 0 && <p className="text-xs text-muted-foreground">No marks entered yet for this exam.</p>}
                       </ul>
                     </div>
                   );
                 })}
               </ScrollArea>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {showCreateExamDialog && (
        <Dialog open={showCreateExamDialog} onOpenChange={(isOpen) => { if(!isOpen) resetExamForm(); else setShowCreateExamDialog(true);}}>
          <DialogContent className="sm:max-w-[480px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
            <DialogHeader><DialogTitle>{editingExam ? 'Edit Exam' : 'Create New Exam'}</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-3">
              <Label htmlFor="examName">Exam Name</Label><Input id="examName" name="name" value={currentExam.name} onChange={handleExamInputChange} />
              <Label htmlFor="examSubject">Subject</Label><Input id="examSubject" name="subject" value={currentExam.subject} onChange={handleExamInputChange} />
              <Label htmlFor="examBatch">Batch/Group Level</Label>
              <Select value={currentExam.batchId} onValueChange={handleExamBatchChange}>
                <SelectTrigger id="examBatch"><SelectValue placeholder="Select Batch" /></SelectTrigger>
                <SelectContent>
                  {batches.map(batch => <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>)}
                  {batches.length === 0 && <SelectItem value="" disabled>No batches created</SelectItem>}
                </SelectContent>
              </Select>
              <Label htmlFor="examDate">Date</Label><Input id="examDate" name="date" type="date" value={currentExam.date} onChange={handleExamInputChange} />
              <Label htmlFor="examTotalMarks">Total Marks</Label><Input id="examTotalMarks" name="totalMarks" type="number" value={currentExam.totalMarks} onChange={handleExamInputChange} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetExamForm}>Cancel</Button>
              <Button onClick={handleSaveExam} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">{editingExam ? 'Save Changes' : 'Create Exam'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showAssignMarksDialog && selectedExamForMarks && (
        <Dialog open={showAssignMarksDialog} onOpenChange={(isOpen) => {
            setShowAssignMarksDialog(isOpen);
            if (!isOpen) setStudentSearchTerm(''); 
        }}>
          <DialogContent className="sm:max-w-md bg-card/90 dark:bg-card/85 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Assign Marks for {selectedExamForMarks.name}</DialogTitle>
              <DialogDescription>Batch: {batches.find(b => b.id === selectedExamForMarks.batchId)?.name || 'N/A'} | Total Marks: {selectedExamForMarks.totalMarks}</DialogDescription>
            </DialogHeader>
            <Input 
              placeholder="Search students in batch..." 
              value={studentSearchTerm} 
              onChange={e => setStudentSearchTerm(e.target.value)} 
              className="my-2 h-8 text-xs" 
            />
            <ScrollArea className="max-h-[60vh] p-1 pr-2">
              <div className="space-y-2">
                {filteredStudentNamesForMarks.map(studentName => (
                  <div key={studentName} className="grid grid-cols-3 items-center gap-2">
                    <Label htmlFor={`marks-${studentName}`} className="col-span-1 text-sm">{studentName}</Label>
                    <Input
                      id={`marks-${studentName}`}
                      type="number"
                      value={studentMarks[studentName] || ''}
                      onChange={(e) => handleStudentMarkChange(studentName, e.target.value)}
                      placeholder={`0-${selectedExamForMarks.totalMarks}`}
                      className="col-span-2 h-8 text-sm"
                      max={selectedExamForMarks.totalMarks}
                      min="0"
                    />
                  </div>
                ))}
                {filteredStudentNamesForMarks.length === 0 && <p className="text-xs text-muted-foreground text-center">No students match search in this batch.</p>}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setShowAssignMarksDialog(false); setStudentSearchTerm('');}}>Cancel</Button>
              <Button onClick={handleSaveStudentMarks} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">Save Marks</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </ScrollArea>
  );
};

export default ExamManagement;
