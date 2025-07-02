import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData, studentDetailFields, initialStudentData } from '@/lib/dataStore';
import { Edit3, Search } from 'lucide-react';

const StudentDetailsManagement = ({ user }) => {
  const { toast } = useToast();
  const [studentDetails, setStudentDetails] = useState(loadData('studentDetails', {}));
  const [selectedStudent, setSelectedStudent] = useState('');
  const [currentDetails, setCurrentDetails] = useState(initialStudentData());
  const [editingStudentName, setEditingStudentName] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const isMaster = user?.type === 'master';

  useEffect(() => {
    if(isMaster) saveData('studentDetails', studentDetails);
  }, [studentDetails, isMaster]);

  const handleSelectStudentToManage = (studentName) => {
    setSelectedStudent(studentName);
    setEditingStudentName(studentName);
    setCurrentDetails(studentDetails[studentName] || initialStudentData());
    setStudentPhoto(studentDetails[studentName]?.photo || null);
    if (isMaster) {
        setShowEditDialog(true);
    } else {
        toast({ variant: "destructive", title: "Permission Denied", description: "Only masters can edit student details." });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result); 
         setCurrentDetails(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
      toast({ title: "Photo Selected", description: `${file.name} ready for upload. (Simulated)`, className: "bg-blue-500 text-white"});
    }
  };

  const handleSaveDetails = () => {
    if (!editingStudentName || !isMaster) {
      toast({ variant: "destructive", title: "Error", description: "Cannot save details. No student selected or insufficient permissions." });
      return;
    }
    setStudentDetails(prev => ({ ...prev, [editingStudentName]: { ...currentDetails, photo: studentPhoto } }));
    toast({ title: "Details Saved", description: `Details for ${editingStudentName} updated.`, className: "bg-green-500 text-white" });
    setShowEditDialog(false);
    setEditingStudentName(null);
    // Do not clear selectedStudent so the list remains focused if needed
    setCurrentDetails(initialStudentData());
    setStudentPhoto(null);
  };

  const filteredStudentNames = studentNames.filter(name => name.toLowerCase().includes(studentSearchTerm.toLowerCase()));

  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">Manage Student Details</CardTitle>
          <CardDescription>
            {isMaster ? "Select a student to add or edit their personal information." : "View student details. Editing is restricted to Masters."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="studentSearchForDetails" className="mb-1 block">Search and Select Student</Label>
            <div className="flex space-x-2">
                <Input 
                    id="studentSearchForDetails"
                    type="text"
                    placeholder="Search student name..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Select value={selectedStudent} onValueChange={handleSelectStudentToManage}>
                    <SelectTrigger className="w-[250px]" id="studentSelectForDetailsTrigger">
                        <SelectValue placeholder="Select student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredStudentNames.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                        {filteredStudentNames.length === 0 && <p className="p-2 text-sm text-muted-foreground">No students match search.</p>}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          {isMaster && (
            <Dialog open={showEditDialog} onOpenChange={(isOpen) => {
                setShowEditDialog(isOpen);
                if (!isOpen) { setEditingStudentName(null); setCurrentDetails(initialStudentData()); setStudentPhoto(null); /* Don't reset selectedStudent here */ }
            }}>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Edit Details for {editingStudentName}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1 pr-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {studentDetailFields.map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <Label htmlFor={field.id}>{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea id={field.id} name={field.id} value={currentDetails[field.id] || ''} onChange={handleInputChange} rows={3}/>
                        ) : (
                          <Input id={field.id} name={field.id} type={field.type} value={currentDetails[field.id] || ''} onChange={handleInputChange} />
                        )}
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <Label htmlFor="studentPhoto">Student Photo</Label>
                      <Input id="studentPhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm"/>
                      {studentPhoto && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                          <img src={studentPhoto} alt="Student Preview" className="h-24 w-24 rounded-md object-cover border"/>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingStudentName(null); setCurrentDetails(initialStudentData()); setStudentPhoto(null); }}>Cancel</Button>
                  <Button onClick={handleSaveDetails}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-primary/80 mb-2">Student List Overview</h3>
            <ScrollArea className="h-[300px] border rounded-md p-3 bg-background/30">
              {filteredStudentNames.length === 0 && <p className="text-center text-muted-foreground py-4">No students match your search criteria.</p>}
              <ul className="space-y-2">
                {filteredStudentNames.map(name => (
                  <li key={name} className="flex justify-between items-center p-2 rounded-md bg-background/50 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center space-x-2">
                        {studentDetails[name]?.photo && <img src={studentDetails[name].photo} alt={name} className="h-8 w-8 rounded-full object-cover"/>}
                        <span className="font-medium text-foreground">{name}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleSelectStudentToManage(name)} className="h-7 px-2 text-xs">
                      <Edit3 className="mr-1 h-3 w-3" /> {isMaster ? (studentDetails[name] ? 'Edit' : 'Add Details') : 'View Details'}
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default StudentDetailsManagement;