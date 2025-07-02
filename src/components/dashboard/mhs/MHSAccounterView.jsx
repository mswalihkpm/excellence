
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
import { DollarSign, Send, BellPlus } from 'lucide-react';

const MHSAccounterView = ({ user }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(loadData('accounterTransactions', []));
  const [currentStudent, setCurrentStudent] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationRecipients = [...studentNames, ...masterNames];


  useEffect(() => {
    saveData('accounterTransactions', transactions);
  }, [transactions]);

  const handleAddTransaction = () => {
    if (!currentStudent || !amount || !description.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please select student, enter amount, and description." });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Amount must be a positive number." });
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      studentName: currentStudent,
      type: transactionType,
      amount: transactionType === 'deposit' ? numAmount : -numAmount,
      description: description.trim(),
      date: new Date().toISOString(),
      recordedBy: user.name,
    };
    setTransactions(prev => [transaction, ...prev]);

    // Update student's cash account
    const studentCashAccountKey = `studentCashAccount_${currentStudent}`;
    const studentAccount = loadData(studentCashAccountKey, { myAccount: [], specialPayments: [] });
    studentAccount.myAccount.push({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
    });
    saveData(studentCashAccountKey, studentAccount);
    
    toast({ title: "Transaction Recorded", description: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of ₹${numAmount} for ${currentStudent} recorded.`, className: "bg-green-500 text-white" });
    setCurrentStudent('');
    setAmount('');
    setDescription('');
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
      source: `MHS Accounter (${user.name})`,
      read: false,
    });
    saveData(userNotificationsKey, userNotifications);
    toast({ title: "Notification Sent", description: `Message sent to ${notificationTarget}.`, className: "bg-blue-500 text-white" });
    setNotificationTarget('');
    setNotificationMessage('');
    setShowNotificationDialog(false);
  };


  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">Accounter Dashboard</CardTitle>
          <CardDescription>Record student deposits and withdrawals. Send notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-background/30 space-y-3">
            <h3 className="text-lg font-semibold text-primary/80">Record Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="accStudentSelect">Student</Label>
                <Select value={currentStudent} onValueChange={setCurrentStudent}>
                  <SelectTrigger id="accStudentSelect"><SelectValue placeholder="Select Student" /></SelectTrigger>
                  <SelectContent>{studentNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="accTransactionType">Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger id="accTransactionType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="accAmount">Amount (₹)</Label>
                <Input id="accAmount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000" />
              </div>
               <div className="md:col-span-2">
                <Label htmlFor="accDescription">Description</Label>
                <Input id="accDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Monthly Mess Fee" />
              </div>
            </div>
            <Button onClick={handleAddTransaction} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <DollarSign className="mr-2 h-5 w-5" /> Record Transaction
            </Button>
          </div>

          <div className="p-4 border rounded-lg bg-background/30 space-y-3">
            <h3 className="text-lg font-semibold text-primary/80">Send Notification</h3>
            <div>
                <Label htmlFor="notificationTargetAcc">Recipient (Student/Master)</Label>
                <Select value={notificationTarget} onValueChange={setNotificationTarget}>
                  <SelectTrigger id="notificationTargetAcc"><SelectValue placeholder="Select Recipient" /></SelectTrigger>
                  <SelectContent>
                    {notificationRecipients.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="notificationMessageAcc">Message</Label>
                <Textarea id="notificationMessageAcc" value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} placeholder="Type your notification here..." rows={3}/>
            </div>
            <Button onClick={handleSendNotification} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <BellPlus className="mr-2 h-5 w-5"/> Send Notification
            </Button>
          </div>


          <div>
            <h3 className="text-lg font-semibold text-primary/80 mb-2">Recent Transactions</h3>
            <ScrollArea className="h-[250px] border rounded-md p-3 bg-background/30">
              {transactions.length === 0 && <p className="text-center text-muted-foreground py-4">No transactions recorded yet.</p>}
              <ul className="space-y-2">
                {transactions.map(t => (
                  <li key={t.id} className={`p-2 rounded-md text-sm ${t.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{t.studentName} - {t.description}</span>
                      <span className={`font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount >= 0 ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</p>
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

export default MHSAccounterView;
