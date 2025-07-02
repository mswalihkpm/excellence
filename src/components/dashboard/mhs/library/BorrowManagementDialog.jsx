import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { studentNames, masterNames } from '@/lib/students';
import { loadData, saveData } from '@/lib/dataStore';

const BorrowManagementDialog = ({ open, onOpenChange, bookToManage, onConfirm, libraryType }) => {
  const { toast } = useToast();
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPlace, setBorrowerPlace] = useState('');
  const eligibleBorrowers = [...studentNames, ...masterNames];
  const [borrowerSearch, setBorrowerSearch] = useState('');

  useEffect(() => {
    if (bookToManage) {
      setBorrowerName(bookToManage.borrower || '');
      setBorrowerPlace(bookToManage.borrowerPlace || '');
    } else {
      setBorrowerName('');
      setBorrowerPlace('');
    }
    setBorrowerSearch('');
  }, [bookToManage, open]);

  const handleInternalConfirm = () => {
    if (!bookToManage) return;

    let updatedBookDetails;
    if (bookToManage.isBorrowed) { // Returning a book
      updatedBookDetails = { ...bookToManage, isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null };
      
      const studentLibMessagesKey = `studentLibMessages_${bookToManage.borrower}`;
      const messages = loadData(studentLibMessagesKey, []);
      messages.push({ date: new Date().toISOString(), text: `Book "${bookToManage.name}" has been returned. Thank you!`, type: libraryType });
      saveData(studentLibMessagesKey, messages);
    } else { // Borrowing a book
      if (!borrowerName) {
        toast({ variant: "destructive", title: "Error", description: "Please select a borrower." });
        return;
      }
      const borrowedDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(borrowedDate.getDate() + 14);
      updatedBookDetails = { ...bookToManage, isBorrowed: true, borrower: borrowerName, borrowedDate: borrowedDate.toISOString(), borrowerPlace: borrowerPlace, dueDate: dueDate.toISOString() };
      
      const studentLibMessagesKey = `studentLibMessages_${borrowerName}`;
      const messages = loadData(studentLibMessagesKey, []);
      messages.push({ date: new Date().toISOString(), text: `You have borrowed "${bookToManage.name}". Due by ${dueDate.toLocaleDateString()}.`, type: libraryType });
      saveData(studentLibMessagesKey, messages);
    }
    onConfirm(updatedBookDetails);
  };
  
  const filteredEligibleBorrowers = eligibleBorrowers.filter(name => name.toLowerCase().includes(borrowerSearch.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/90 dark:bg-card/85 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Manage Borrow: {bookToManage?.name}</DialogTitle>
          <DialogDescription>
            {bookToManage?.isBorrowed ? "Manage return of this book." : "Assign this book to a borrower."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          {bookToManage && !bookToManage.isBorrowed && (
            <>
              <Label htmlFor="borrowerNameDlg">Borrower Name</Label>
              <Input 
                id="borrowerSearchDlg" 
                placeholder="Search borrower..." 
                value={borrowerSearch} 
                onChange={(e) => setBorrowerSearch(e.target.value)} 
                className="mb-1 h-8 text-xs"
              />
              <Select value={borrowerName} onValueChange={setBorrowerName}>
                <SelectTrigger id="borrowerNameDlg"><SelectValue placeholder="Select Student/Master" /></SelectTrigger>
                <SelectContent>
                  {filteredEligibleBorrowers.length > 0 ? 
                    filteredEligibleBorrowers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>) :
                    <SelectItem value="" disabled>No borrowers match search</SelectItem>
                  }
                </SelectContent>
              </Select>
              <Label htmlFor="borrowerPlaceDlg">Place (Optional)</Label>
              <Input id="borrowerPlaceDlg" value={borrowerPlace} onChange={(e) => setBorrowerPlace(e.target.value)} placeholder="Borrower's class, department, etc."/>
              <p className="text-sm text-muted-foreground">Due Date will be 14 days from today.</p>
            </>
          )}
          {bookToManage && bookToManage.isBorrowed && (
            <div>
              <p>This book is currently borrowed by: <strong className="text-primary">{bookToManage.borrower}</strong></p>
              <p>Due Date: {new Date(bookToManage.dueDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleInternalConfirm} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{bookToManage?.isBorrowed ? 'Confirm Return' : 'Confirm Borrow'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BorrowManagementDialog;