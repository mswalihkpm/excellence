import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { generatePassword } from '@/lib/students';
import { loadData, saveData } from '@/lib/dataStore';

const ChangePasswordDialog = ({ user, open, onOpenChange }) => {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast({ variant: "destructive", title: "Error", description: "All password fields are required." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
      return;
    }

    const storedPasswords = loadData('userPasswords', {});
    const userKey = `${user.type}_${user.name.toLowerCase().replace(/\s+/g, '')}${user.subRole ? `_${user.subRole}` : ''}`;
    
    const currentExpectedPassword = storedPasswords[userKey] || generatePassword(user.name, user.type, user.subRole);

    if (oldPassword !== currentExpectedPassword) {
      toast({ variant: "destructive", title: "Error", description: "Old password is incorrect." });
      return;
    }

    storedPasswords[userKey] = newPassword;
    saveData('userPasswords', storedPasswords);

    toast({ title: "Success", description: "Password changed successfully.", className: "bg-green-500 text-white" });
    onOpenChange(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Change Password</DialogTitle>
          <DialogDescription>
            Update your password here. Make sure it's strong and memorable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oldPasswordDialog" className="text-right text-muted-foreground">
              Old Password
            </Label>
            <Input id="oldPasswordDialog" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newPasswordDialog" className="text-right text-muted-foreground">
              New Password
            </Label>
            <Input id="newPasswordDialog" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmNewPasswordDialog" className="text-right text-muted-foreground">
              Confirm New
            </Label>
            <Input id="confirmNewPasswordDialog" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;