import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';

const BatchManagement = () => {
  const { toast } = useToast();
  const [showCreateBatchDialog, setShowCreateBatchDialog] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [selectedStudentsForBatch, setSelectedStudentsForBatch] = useState([]);
  const [batches, setBatches] = useState(loadData('batches', []));
  const [editingBatch, setEditingBatch] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});

  useEffect(() => {
    saveData('batches', batches);
  }, [batches]);

  const handleStudentSelectionForBatch = (studentName) => {
    setSelectedStudentsForBatch(prev =>
      prev.includes(studentName) ? prev.filter(s => s !== studentName) : [...prev, studentName]
    );
  };

  const handleSaveBatch = () => {
    if (!batchName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Batch name is required." });
      return;
    }
    if (selectedStudentsForBatch.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Please select at least one student for the batch." });
      return;
    }

    const newBatch = {
      id: editingBatch ? editingBatch.id : Date.now().toString(),
      name: batchName,
      students: selectedStudentsForBatch,
      details: editingBatch ? { ...editingBatch.details, ...studentDetails } : studentDetails
    };

    if (editingBatch) {
      setBatches(batches.map(b => b.id === editingBatch.id ? newBatch : b));
      toast({ title: "Success", description: "Batch updated successfully.", className: "bg-green-500 text-white" });
    } else {
      setBatches([...batches, newBatch]);
      toast({ title: "Success", description: "Batch created successfully.", className: "bg-green-500 text-white" });
    }

    setShowCreateBatchDialog(false);
    setBatchName('');
    setSelectedStudentsForBatch([]);
    setStudentDetails({});
    setEditingBatch(null);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setBatchName(batch.name);
    setSelectedStudentsForBatch(batch.students);
    setStudentDetails(batch.details || {});
    setShowCreateBatchDialog(true);
  };

  const handleDeleteBatch = (batchId) => {
    setBatches(batches.filter(b => b.id !== batchId));
    toast({ title: "Success", description: "Batch deleted successfully.", className: "bg-red-500 text-white" });
  };

  const handleStudentDetailChange = (studentName, detail) => {
    setStudentDetails(prev => ({
      ...prev,
      [studentName]: detail
    }));
  };

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-primary/90">Manage Batches</CardTitle>
          <Dialog open={showCreateBatchDialog} onOpenChange={setShowCreateBatchDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingBatch(null); setBatchName(''); setSelectedStudentsForBatch([]); setStudentDetails({}); setShowCreateBatchDialog(true); }} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">
                <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" /> {editingBatch ? "Edit Batch" : "Create Batch"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
                <DialogDescription>
                  {editingBatch ? "Update the batch details below." : "Fill in the details to create a new batch."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batchNameDialog" className="text-right text-muted-foreground">
                    Batch Name
                  </Label>
                  <Input id="batchNameDialog" value={batchName} onChange={(e) => setBatchName(e.target.value)} className="col-span-3" placeholder="e.g., Morning Scholars" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2 text-muted-foreground">Students</Label>
                  <ScrollArea className="col-span-3 h-[150px] sm:h-[200px] w-full rounded-md border p-4 bg-background/50">
                    <div className="space-y-2">
                      {studentNames.map(student => (
                        <div key={student} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-checkbox-${student.replace(/\s+/g, '-')}`}
                            checked={selectedStudentsForBatch.includes(student)}
                            onCheckedChange={() => handleStudentSelectionForBatch(student)}
                          />
                          <label
                            htmlFor={`student-checkbox-${student.replace(/\s+/g, '-')}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {student}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                {selectedStudentsForBatch.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2 text-muted-foreground">Student Details</Label>
                    <ScrollArea className="col-span-3 h-[150px] sm:h-[200px] w-full rounded-md border p-4 bg-background/50 space-y-3">
                      {selectedStudentsForBatch.map(student => (
                        <div key={`detail-input-div-${student}`}>
                          <Label htmlFor={`detail-input-${student.replace(/\s+/g, '-')}`} className="text-sm font-medium text-foreground/80">{student}</Label>
                          <Input
                            id={`detail-input-${student.replace(/\s+/g, '-')}`}
                            value={studentDetails[student] || ''}
                            onChange={(e) => handleStudentDetailChange(student, e.target.value)}
                            placeholder={`Add notes for ${student}...`}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowCreateBatchDialog(false); setEditingBatch(null); }}>Cancel</Button>
                <Button onClick={handleSaveBatch} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">{editingBatch ? "Save Changes" : "Create Batch"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4 h-[calc(100%-4rem)]">
        <ScrollArea className="h-full pr-2">
          {batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map(batch => (
                <Card key={batch.id} className="bg-background/50 dark:bg-background/40 shadow-sm">
                  <CardHeader className="flex flex-row justify-between items-center py-2 px-3 sm:py-3 sm:px-4">
                    <CardTitle className="text-md sm:text-lg text-primary/80">{batch.name}</CardTitle>
                    <div className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditBatch(batch)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 h-7 w-7 sm:h-8 sm:w-8">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBatch(batch.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 w-7 sm:h-8 sm:w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-2 sm:px-4 sm:pb-3">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Students ({batch.students.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {batch.students.map(student => (
                        <span key={student} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{student}</span>
                      ))}
                    </div>
                    {Object.keys(batch.details || {}).length > 0 && (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 mb-0.5">Specific Details:</p>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-xs">
                          {Object.entries(batch.details).map(([student, detail]) => (
                            detail.trim() && <li key={student}><strong className="text-foreground/70">{student}:</strong> {detail}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
              <p className="text-center text-muted-foreground py-10">No batches created yet. Click "Create Batch" to get started.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BatchManagement;