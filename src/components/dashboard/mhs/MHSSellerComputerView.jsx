
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { studentNames, masterNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { Send, Trash2, DollarSign, BellPlus } from 'lucide-react';

const MHSSellerComputerView = ({ user, department }) => {
  const { toast } = useToast();
  const storageKey = `departmentDebts_${department}`;
  const [debts, setDebts] = useState(loadData(storageKey, [])); // Each item: { studentName: '', amount: 0, id: '' }
  const [currentStudent, setCurrentStudent] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const [notificationTarget, setNotificationTarget] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationRecipients = [...studentNames, ...masterNames];


  useEffect(() => {
    saveData(storageKey, debts);
  }, [debts, storageKey]);

  const handleAddDebt = () => {
    if (!currentStudent || !currentAmount) {
      toast({ variant: "destructive", title: "Error", description: "Please select student and enter debt amount." });
      return;
    }
    const numAmount = parseFloat(currentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Amount must be a positive number." });
      return;
    }

    const existingDebtIndex = debts.findIndex(d => d.studentName === currentStudent);
    if (existingDebtIndex > -1) {
      // Update existing debt
      const updatedDebts = debts.map((debt, index) => 
        index === existingDebtIndex ? { ...debt, amount: debt.amount + numAmount } : debt
      );
      setDebts(updatedDebts);
    } else {
      // Add new debt
      setDebts(prev => [...prev, { id: Date.now().toString(), studentName: currentStudent, amount: numAmount }]);
    }
    
    toast({ title: "Debt Added/Updated", description: `Debt of ₹${numAmount} for ${currentStudent} recorded.`, className: "bg-blue-500 text-white" });
    setCurrentStudent('');
    setCurrentAmount('');
  };

  const handleRemoveDebt = (studentName) => {
    setDebts(prev => prev.filter(d => d.studentName !== studentName));
    toast({ title: "Debt Cleared", description: `Debt for ${studentName} cleared from this list.`, className: "bg-orange-500 text-white" });
  };
  
  const handleSendDebts = () => {
    if (debts.length === 0) {
      toast({ variant: "destructive", title: "No Debts", description: "No debts to send." });
      return;
    }
    
    const paymentCategory = department === 'seller' ? 'Bakkala' : (department === 'computer' ? 'Computer' : 'Miscellaneous');

    debts.forEach(debt => {
      const studentCashAccountKey = `studentCashAccount_${debt.studentName}`;
      const studentCashAccount = loadData(studentCashAccountKey, { myAccount: [], personalTransactions: [], specialPayments: [] });
      
      const existingPayment = studentCashAccount.specialPayments.find(p => p.description === `${paymentCategory} Dues (ID: ${debt.id})`);

      if (!existingPayment) {
        studentCashAccount.specialPayments.push({
          committee: paymentCategory,
          amount: debt.amount,
          date: new Date().toISOString(),
          description: `${paymentCategory} Dues (ID: ${debt.id})` 
        });
        saveData(studentCashAccountKey, studentCashAccount);
      } else if (existingPayment.amount !== debt.amount) {
         existingPayment.amount = debt.amount;
         existingPayment.date = new Date().toISOString(); 
         saveData(studentCashAccountKey, studentCashAccount);
      }
    });

    toast({ title: "Debts Sent", description: `All recorded debts sent to respective students' Special Payments under ${paymentCategory}.`, className: "bg-green-500 text-white" });
  };

  const handleSendNotification = () => {
    if (!notificationTarget || !notificationMessage.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please select recipient and enter a message." });
      return;
    }
    const userNotificationsKey = `userNotifications_${notificationTarget}`;
    const userNotifications = loadData(userNotificationsKey, []);
    userNotifications.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: notificationMessage.trim(),
      source: `MHS ${department.charAt(0).toUpperCase() + department.slice(1)} (${user.name})`,
      read: false,
    });
    saveData(userNotificationsKey, userNotifications);
    toast({ title: "Notification Sent", description: `Message sent to ${notificationTarget}.`, className: "bg-blue-500 text-white" });
    setNotificationTarget('');
    setNotificationMessage('');
  };

  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">{department.charAt(0).toUpperCase() + department.slice(1)} Department Debts</CardTitle>
          <CardDescription>Record and manage student debts for the {department} department. Send notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-background/30 space-y-3">
            <h3 className="text-lg font-semibold text-primary/80">Add/Update Student Debt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="debtStudentSelect">Student</Label>
                <Select value={currentStudent} onValueChange={setCurrentStudent}>
                  <SelectTrigger id="debtStudentSelect"><SelectValue placeholder="Select Student" /></SelectTrigger>
                  <SelectContent>{studentNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="debtAmount">Amount (₹)</Label>
                <Input id="debtAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="e.g., 50" />
              </div>
            </div>
            <Button onClick={handleAddDebt} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <DollarSign className="mr-2 h-5 w-5" /> Add/Update Debt
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-background/30 space-y-3">
            <h3 className="text-lg font-semibold text-primary/80">Send Notification</h3>
            <div>
                <Label htmlFor={`notificationTarget${department}`}>Recipient (Student/Master)</Label>
                <Select value={notificationTarget} onValueChange={setNotificationTarget}>
                  <SelectTrigger id={`notificationTarget${department}`}><SelectValue placeholder="Select Recipient" /></SelectTrigger>
                  <SelectContent>
                    {notificationRecipients.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor={`notificationMessage${department}`}>Message</Label>
                <Textarea id={`notificationMessage${department}`} value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder="Type your notification here..." rows={3}/>
            </div>
            <Button onClick={handleSendNotification} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <BellPlus className="mr-2 h-5 w-5"/> Send Notification
            </Button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-primary/80">Current Debt List</h3>
              {debts.length > 0 && (
                <Button onClick={handleSendDebts} size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <Send className="mr-2 h-4 w-4" /> Send All to Students
                </Button>
              )}
            </div>
            <ScrollArea className="h-[250px] border rounded-md p-3 bg-background/30">
              {debts.length === 0 && <p className="text-center text-muted-foreground py-4">No debts recorded for {department}.</p>}
              <ul className="space-y-2">
                {debts.map(debt => (
                  <li key={debt.id} className="flex justify-between items-center p-2 rounded-md bg-background/50 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{debt.studentName}</span>
                      <p className="text-xs text-muted-foreground">Debt: ₹{debt.amount.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveDebt(debt.studentName)} className="text-red-500 hover:text-red-600 h-7 w-7">
                      <Trash2 className="h-4 w-4" />
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

export default MHSSellerComputerView;
