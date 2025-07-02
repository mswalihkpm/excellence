import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { masterNames as initialMasterNames, mhsUserNamesAndRoles as initialMhsUsers, generatePassword } from '@/lib/students';
import { loadData, saveData } from '@/lib/dataStore';
import { Eye, EyeOff } from 'lucide-react';

const UserCredentialsForm = ({ userType, role, subRole, onLoginSuccess, onLoginFail, loginAttempts }) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [currentStudentList, setCurrentStudentList] = useState([]);
  const [currentMasterList, setCurrentMasterList] = useState([]);
  const [currentMhsUserList, setCurrentMhsUserList] = useState([]);


  useEffect(() => {
    if (userType === 'student') {
      setCurrentStudentList(loadData('managedStudents', []));
    } else if (userType === 'master') {
      setCurrentMasterList(loadData('managedMasters', initialMasterNames));
    } else if (userType === 'mhs') {
      const allMhsUsers = loadData('managedMHSUsers', initialMhsUsers);
      if (role === 'other') {
        setCurrentMhsUserList(allMhsUsers.filter(u => u.role === 'other' && u.subRole === subRole).map(u => u.name));
      } else {
        setCurrentMhsUserList(allMhsUsers.filter(u => u.role === role).map(u => u.name));
      }
    }
  }, [userType, role, subRole]);
  
  const filteredStudentList = userType === 'student' 
    ? currentStudentList.filter(name => name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    : [];


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ variant: "destructive", title: "Error", description: "Username and password are required." });
      return;
    }

    const userKey = username.toLowerCase().replace(/\s+/g, '');
    const storedPasswords = loadData('userPasswords', {});
    
    let userPasswordKey = `${userType}_${userKey}`;
    if (userType === 'mhs') {
        const mhsUserDetails = loadData('managedMHSUsers', initialMhsUsers).find(u => u.name === username);
        if (mhsUserDetails) {
            if (mhsUserDetails.role === 'other' && mhsUserDetails.subRole) {
                userPasswordKey = `${userType}_${userKey}_${mhsUserDetails.subRole}`;
            } else {
                userPasswordKey = `${userType}_${userKey}_${mhsUserDetails.role}`;
            }
        } else {
             // Fallback for MHS users not in managedMHSUsers (e.g. initial ones if not migrated)
            if (subRole) { // 'other' MHS users
                userPasswordKey = `${userType}_${userKey}_${subRole}`;
            } else if (role) { // president, secretary
                userPasswordKey = `${userType}_${userKey}_${role}`;
            }
        }
    }
    
    const expectedPassword = storedPasswords[userPasswordKey] || generatePassword(username, userType, subRole);


    if (password === expectedPassword) {
      toast({ title: "Login Successful", description: `Welcome, ${username}!`, className: "bg-green-500 text-white" });
      onLoginSuccess({ name: username, type: userType, role, subRole });
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid username or password." });
      onLoginFail(username);
    }
  };
  
  const handleForgotPassword = () => {
    if (!username) {
        toast({ variant: "destructive", title: "Username Required", description: "Please select your username first to request a password reset." });
        return;
    }
    
    const masterNaufal = "NOUFAL ADANY"; 
    const masterNotificationsKey = `userNotifications_${masterNaufal}`;
    const masterNotifications = loadData(masterNotificationsKey, []);
    
    const recoveryNotification = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        text: `${username} (${userType}${role ? ` - ${role}` : ''}${subRole ? ` (${subRole})` : ''}) has forgotten their password and requests an unlock.`,
        type: 'password_recovery',
        recoveryData: { 
            userToUnlock: username, 
            userType: userType,
            userRole: role,
            userSubRole: subRole,
            id: Date.now().toString() + '_recovery' 
        },
        read: false,
    };
    
    masterNotifications.push(recoveryNotification);
    saveData(masterNotificationsKey, masterNotifications);
    
    toast({ title: "Password Reset Requested", description: `A request to unlock your password has been sent to ${masterNaufal}.`, className: "bg-blue-500 text-white" });
  };

  const userLoginAttempts = username ? (loginAttempts[username.toLowerCase().replace(/\s+/g, '')] || 0) : 0;

  let displayUserList = [];
  if (userType === 'student') displayUserList = filteredStudentList;
  else if (userType === 'master') displayUserList = currentMasterList;
  else if (userType === 'mhs') displayUserList = currentMhsUserList;


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <Label htmlFor="username">Username</Label>
        {userType === 'student' && (
          <>
            <Input 
              id="studentSearchLogin"
              type="text"
              placeholder="Search student name..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="mt-1 mb-1 h-8 text-sm"
            />
            <Select value={username} onValueChange={setUsername}>
              <SelectTrigger id="username"><SelectValue placeholder="Select Username" /></SelectTrigger>
              <SelectContent>
                {displayUserList.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                {displayUserList.length === 0 && studentSearchTerm && <p className="p-2 text-sm text-muted-foreground">No students match search.</p>}
                {displayUserList.length === 0 && !studentSearchTerm && <p className="p-2 text-sm text-muted-foreground">No students available.</p>}
              </SelectContent>
            </Select>
          </>
        )}
        {userType !== 'student' && (
            <Select value={username} onValueChange={setUsername}>
                <SelectTrigger id="username"><SelectValue placeholder="Select Username" /></SelectTrigger>
                <SelectContent>
                    {displayUserList.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    {displayUserList.length === 0 && <p className="p-2 text-sm text-muted-foreground">No users available for this role.</p>}
                </SelectContent>
            </Select>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">Login</Button>
      {userLoginAttempts >= 5 && (
        <Button type="button" variant="link" className="w-full text-orange-500 hover:text-orange-600" onClick={handleForgotPassword}>
          Forgot Password? Unlock with Master's Help
        </Button>
      )}
    </form>
  );
};

export default UserCredentialsForm;