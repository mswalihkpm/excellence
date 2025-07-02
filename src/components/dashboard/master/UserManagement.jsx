import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { studentNames as initialStudentNames, masterNames as initialMasterNames, mhsUserNamesAndRoles as initialMhsUsers, mhsOtherSubRoles, generatePassword } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { UserPlus, Trash2, Users, Shield, Building } from 'lucide-react';

const UserManagement = ({ masterUser }) => {
  const { toast } = useToast();

  const [students, setStudents] = useState(loadData('managedStudents', initialStudentNames));
  const [masters, setMasters] = useState(loadData('managedMasters', initialMasterNames));
  const [mhsUsers, setMhsUsers] = useState(loadData('managedMHSUsers', initialMhsUsers));
  
  const [userTypeToAdd, setUserTypeToAdd] = useState('student');
  const [newUserName, setNewUserName] = useState('');
  const [newMhsRole, setNewMhsRole] = useState('president');
  const [newMhsSubRole, setNewMhsSubRole] = useState(mhsOtherSubRoles[0]?.value || 'accounter');

  useEffect(() => { saveData('managedStudents', students); }, [students]);
  useEffect(() => { saveData('managedMasters', masters); }, [masters]);
  useEffect(() => { saveData('managedMHSUsers', mhsUsers); }, [mhsUsers]);

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "User name cannot be empty." });
      return;
    }

    const trimmedUserName = newUserName.trim();
    let userExists;
    let successMessage = "";

    switch (userTypeToAdd) {
      case 'student':
        userExists = students.includes(trimmedUserName);
        if (!userExists) {
          setStudents(prev => [...prev, trimmedUserName]);
          const userPasswords = loadData('userPasswords', {});
          const studentKey = `student_${trimmedUserName.toLowerCase().replace(/\s+/g, '')}`;
          userPasswords[studentKey] = generatePassword(trimmedUserName, 'student');
          saveData('userPasswords', userPasswords);
          successMessage = `${trimmedUserName} added as a student. Default password set.`;
        }
        break;
      case 'master':
        userExists = masters.includes(trimmedUserName);
        if (!userExists) {
          setMasters(prev => [...prev, trimmedUserName]);
          const userPasswords = loadData('userPasswords', {});
          const masterKey = `master_${trimmedUserName.toLowerCase().replace(/\s+/g, '')}`;
          userPasswords[masterKey] = generatePassword(trimmedUserName, 'master');
          saveData('userPasswords', userPasswords);
          successMessage = `${trimmedUserName} added as a master. Default password set.`;
        }
        break;
      case 'mhs':
        userExists = mhsUsers.some(u => u.name === trimmedUserName);
        if (!userExists) {
          const mhsUserObject = { 
            name: trimmedUserName, 
            role: newMhsRole, 
            ...(newMhsRole === 'other' && { subRole: newMhsSubRole })
          };
          setMhsUsers(prev => [...prev, mhsUserObject]);
          const userPasswords = loadData('userPasswords', {});
          let mhsKey = `mhs_${trimmedUserName.toLowerCase().replace(/\s+/g, '')}_${newMhsRole}`;
          if (newMhsRole === 'other' && newMhsSubRole) {
            mhsKey = `mhs_${trimmedUserName.toLowerCase().replace(/\s+/g, '')}_${newMhsSubRole}`;
          }
          userPasswords[mhsKey] = generatePassword(trimmedUserName, 'mhs', newMhsSubRole);
          saveData('userPasswords', userPasswords);
          successMessage = `${trimmedUserName} added as MHS User (${newMhsRole}${newMhsRole === 'other' ? ` - ${newMhsSubRole}` : ''}). Default password set.`;
        }
        break;
      default:
        toast({ variant: "destructive", title: "Error", description: "Invalid user type selected." });
        return;
    }

    if (userExists) {
      toast({ variant: "destructive", title: "Error", description: `${trimmedUserName} already exists as a ${userTypeToAdd}.` });
    } else {
      toast({ title: "User Added", description: successMessage, className: "bg-green-500 text-white" });
      setNewUserName('');
    }
  };

  const handleDeleteUser = (userName, type) => {
    if (type === 'master' && userName === masterUser.name) {
      toast({ variant: "destructive", title: "Action Denied", description: "Cannot delete your own master account." });
      return;
    }
    
    const userPasswords = loadData('userPasswords', {});
    const userKeyBase = userName.toLowerCase().replace(/\s+/g, '');

    switch (type) {
      case 'student': 
        setStudents(prev => prev.filter(name => name !== userName)); 
        delete userPasswords[`student_${userKeyBase}`];
        break;
      case 'master': 
        setMasters(prev => prev.filter(name => name !== userName)); 
        delete userPasswords[`master_${userKeyBase}`];
        break;
      case 'mhs': 
        const mhsUserToDelete = mhsUsers.find(u => u.name === userName);
        if (mhsUserToDelete) {
          let mhsKey = `mhs_${userKeyBase}_${mhsUserToDelete.role}`;
          if (mhsUserToDelete.role === 'other' && mhsUserToDelete.subRole) {
            mhsKey = `mhs_${userKeyBase}_${mhsUserToDelete.subRole}`;
          }
          delete userPasswords[mhsKey];
        }
        setMhsUsers(prev => prev.filter(u => u.name !== userName)); 
        break;
      default: 
        toast({ variant: "destructive", title: "Error", description: "Invalid user type for deletion." }); 
        return;
    }
    saveData('userPasswords', userPasswords);
    toast({ title: "User Deleted", description: `${userName} removed from ${type} list and login credentials cleared.`, className: "bg-red-500 text-white" });
  };

  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">User Management</CardTitle>
          <CardDescription>Add or remove students, masters, and MHS users. Default passwords are set upon creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><UserPlus className="mr-2 h-5 w-5"/> Add New User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="userTypeAdd">User Type</Label>
                  <Select value={userTypeToAdd} onValueChange={setUserTypeToAdd}>
                    <SelectTrigger id="userTypeAdd"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="mhs">MHS User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newUserName">User Name</Label>
                  <Input id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name"/>
                </div>
                {userTypeToAdd === 'mhs' && (
                  <>
                    <div>
                      <Label htmlFor="newMhsRole">MHS Role</Label>
                      <Select value={newMhsRole} onValueChange={setNewMhsRole}>
                        <SelectTrigger id="newMhsRole"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="president">President</SelectItem>
                          <SelectItem value="secretary">Secretary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newMhsRole === 'other' && (
                       <div>
                        <Label htmlFor="newMhsSubRole">MHS Sub-Role (if Other)</Label>
                        <Select value={newMhsSubRole} onValueChange={setNewMhsSubRole}>
                          <SelectTrigger id="newMhsSubRole"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {mhsOtherSubRoles.map(sub => <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={handleAddUser}>Add User</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <UserList title="Students" users={students} icon={Users} type="student" onDelete={handleDeleteUser} />
          <UserList title="Masters" users={masters} icon={Shield} type="master" onDelete={handleDeleteUser} />
          <UserListMHS title="MHS Users" users={mhsUsers} icon={Building} type="mhs" onDelete={handleDeleteUser} />

        </CardContent>
      </Card>
    </ScrollArea>
  );
};

const UserList = ({ title, users, icon: Icon, type, onDelete }) => (
  <div>
    <h3 className="text-lg font-semibold text-primary/80 mb-2 flex items-center"><Icon className="mr-2 h-5 w-5"/>{title} ({users.length})</h3>
    <ScrollArea className="h-[180px] border rounded-md p-3 bg-background/30">
      {users.length === 0 && <p className="text-center text-muted-foreground py-4">No {type}s found.</p>}
      <ul className="space-y-1.5">
        {users.map(name => (
          <li key={name} className="flex justify-between items-center p-1.5 rounded-md bg-background/50 text-sm hover:bg-accent/30">
            <span className="text-foreground">{name}</span>
            <Button variant="ghost" size="icon" onClick={() => onDelete(name, type)} className="text-red-500 hover:text-red-600 h-6 w-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  </div>
);

const UserListMHS = ({ title, users, icon: Icon, type, onDelete }) => (
  <div>
    <h3 className="text-lg font-semibold text-primary/80 mb-2 flex items-center"><Icon className="mr-2 h-5 w-5"/>{title} ({users.length})</h3>
    <ScrollArea className="h-[180px] border rounded-md p-3 bg-background/30">
      {users.length === 0 && <p className="text-center text-muted-foreground py-4">No MHS users found.</p>}
      <ul className="space-y-1.5">
        {users.map(user => (
          <li key={user.name} className="flex justify-between items-center p-1.5 rounded-md bg-background/50 text-sm hover:bg-accent/30">
            <div>
              <span className="text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground ml-2">({user.role}{user.subRole ? ` - ${user.subRole}` : ''})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(user.name, type)} className="text-red-500 hover:text-red-600 h-6 w-6">
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  </div>
);

export default UserManagement;