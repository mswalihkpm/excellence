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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-primary">Manage Batches</h2>
        <Dialog open={showCreateBatchDialog} onOpenChange={setShowCreateBatchDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBatch(null); setBatchName(''); setSelectedStudentsForBatch([]); setStudentDetails({}); setShowCreateBatchDialog(true); }} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> {editingBatch ? "Edit Batch" : "Create Batch"}
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
                <ScrollArea className="col-span-3 h-[200px] w-full rounded-md border p-4 bg-background/50">
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
                  <ScrollArea className="col-span-3 h-[200px] w-full rounded-md border p-4 bg-background/50 space-y-3">
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

      {batches.length > 0 ? (
        <div className="space-y-4">
          {batches.map(batch => (
            <Card key={batch.id} className="bg-card/80 dark:bg-card/70 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl text-primary/90">{batch.name}</CardTitle>
                <div className="space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditBatch(batch)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                    <Edit3 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBatch(batch.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">Students ({batch.students.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {batch.students.map(student => (
                    <span key={student} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{student}</span>
                  ))}
                </div>
                {Object.keys(batch.details || {}).length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground mt-3 mb-1">Specific Details:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                      {Object.entries(batch.details).map(([student, detail]) => (
                        detail.trim() && <li key={student}><strong className="text-foreground/80">{student}:</strong> {detail}</li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No batches created yet. Click "Create Batch" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchManagement;