import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { FilePlus, Send, Trash2 } from 'lucide-react';

const CreateSubscription = () => {
  const { toast } = useToast();
  const [subscriptionName, setSubscriptionName] = useState('');
  const [studentSubscriptions, setStudentSubscriptions] = useState(loadData('studentSubscriptions', [])); // [{ studentName, subName, amount, id }]
  
  const [currentStudent, setCurrentStudent] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  const handleAddSubscription = () => {
    if (!subscriptionName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a subscription name first." });
      return;
    }
    if (!currentStudent || !currentAmount) {
      toast({ variant: "destructive", title: "Error", description: "Please select student and enter subscription amount." });
      return;
    }
    const numAmount = parseFloat(currentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Amount must be a positive number." });
      return;
    }

    const newSubEntry = {
      id: Date.now().toString(),
      studentName: currentStudent,
      subName: subscriptionName,
      amount: numAmount,
    };

    setStudentSubscriptions(prev => [...prev, newSubEntry]);
    saveData('studentSubscriptions', [...studentSubscriptions, newSubEntry]);
    
    toast({ title: "Subscription Added", description: `${subscriptionName} of ₹${numAmount} for ${currentStudent} recorded.`, className: "bg-blue-500 text-white" });
    setCurrentStudent('');
    setCurrentAmount('');
  };

  const handleRemoveSubscription = (id) => {
    const updatedSubs = studentSubscriptions.filter(sub => sub.id !== id);
    setStudentSubscriptions(updatedSubs);
    saveData('studentSubscriptions', updatedSubs);
    toast({ title: "Subscription Removed", description: `Subscription entry removed.`, className: "bg-orange-500 text-white" });
  };
  
  const handleSendSubscriptionsToStudents = () => {
    if (studentSubscriptions.length === 0) {
      toast({ variant: "destructive", title: "No Subscriptions", description: "No subscriptions to send." });
      return;
    }
    
    studentSubscriptions.forEach(sub => {
      const studentCashAccountKey = `studentCashAccount_${sub.studentName}`;
      const studentCashAccount = loadData(studentCashAccountKey, { myAccount: [], personalTransactions: [], specialPayments: [] });
      
      const existingPayment = studentCashAccount.specialPayments.find(p => p.description === `${sub.subName} (ID: ${sub.id})`);

      if (!existingPayment) {
        studentCashAccount.specialPayments.push({
          committee: 'Subscriptions', // General category for subscriptions
          amount: sub.amount,
          date: new Date().toISOString(),
          description: `${sub.subName} (ID: ${sub.id})`
        });
        saveData(studentCashAccountKey, studentCashAccount);
      } else if (existingPayment.amount !== sub.amount || existingPayment.committee !== sub.subName) {
         existingPayment.amount = sub.amount;
         existingPayment.committee = 'Subscriptions';
         existingPayment.description = `${sub.subName} (ID: ${sub.id})`;
         existingPayment.date = new Date().toISOString();
         saveData(studentCashAccountKey, studentCashAccount);
      }
    });

    toast({ title: "Subscriptions Sent", description: `All recorded subscriptions sent to respective students' Special Payments.`, className: "bg-green-500 text-white" });
    // Optionally clear after sending: setStudentSubscriptions([]); saveData('studentSubscriptions', []); setSubscriptionName('');
  };

  const currentSubscriptionList = studentSubscriptions.filter(s => s.subName === subscriptionName);

  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">Create & Manage Subscriptions</CardTitle>
          <CardDescription>Define a subscription and assign it to students with amounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-background/30 space-y-3">
            <h3 className="text-lg font-semibold text-primary/80">Define Subscription</h3>
            <div>
              <Label htmlFor="subscriptionName">Subscription Name</Label>
              <Input 
                id="subscriptionName" 
                value={subscriptionName} 
                onChange={(e) => setSubscriptionName(e.target.value)} 
                placeholder="e.g., Annual Magazine Fee, Special Event Contribution" 
              />
            </div>
          </div>

          {subscriptionName.trim() && (
            <div className="p-4 border rounded-lg bg-background/30 space-y-3">
                <h3 className="text-lg font-semibold text-primary/80">Assign "{subscriptionName}" to Students</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="subStudentSelect">Student</Label>
                    <Select value={currentStudent} onValueChange={setCurrentStudent}>
                    <SelectTrigger id="subStudentSelect"><SelectValue placeholder="Select Student" /></SelectTrigger>
                    <SelectContent>{studentNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="subAmount">Amount (₹)</Label>
                    <Input id="subAmount" type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="e.g., 100" />
                </div>
                </div>
                <Button onClick={handleAddSubscription} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <FilePlus className="mr-2 h-5 w-5" /> Add Student to "{subscriptionName}"
                </Button>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-primary/80">
                {subscriptionName.trim() ? `Students Assigned to "${subscriptionName}"` : "All Recorded Subscriptions"}
              </h3>
              {currentSubscriptionList.length > 0 && subscriptionName.trim() && (
                <Button onClick={handleSendSubscriptionsToStudents} size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <Send className="mr-2 h-4 w-4" /> Send "{subscriptionName}" to Students
                </Button>
              )}
            </div>
            <ScrollArea className="h-[250px] border rounded-md p-3 bg-background/30">
              {(subscriptionName.trim() ? currentSubscriptionList : studentSubscriptions).length === 0 && 
                <p className="text-center text-muted-foreground py-4">
                  {subscriptionName.trim() ? `No students assigned to "${subscriptionName}" yet.` : "No subscriptions recorded yet."}
                </p>
              }
              <ul className="space-y-2">
                {(subscriptionName.trim() ? currentSubscriptionList : studentSubscriptions).map(sub => (
                  <li key={sub.id} className="flex justify-between items-center p-2 rounded-md bg-background/50 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{sub.studentName}</span>
                      <p className="text-xs text-muted-foreground">Subscription: {sub.subName} - Amount: ₹{sub.amount.toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSubscription(sub.id)} className="text-red-500 hover:text-red-600 h-7 w-7">
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

export default CreateSubscription;