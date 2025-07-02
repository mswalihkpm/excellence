import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { loadData } from '@/lib/dataStore';

const StudentCashAccountTab = ({ user }) => {
  const studentCashAccount = loadData(`studentCashAccount_${user.name}`, { myAccount: [], specialPayments: [] });
  const totalBalance = studentCashAccount.myAccount.reduce((sum, item) => sum + item.amount, 0);

  const specialPaymentCategories = ['Bakkala', 'Computer', 'Subscriptions'];

  const renderSpecialPayments = (category) => {
    const payments = studentCashAccount.specialPayments.filter(p => p.committee === category || (category === 'Subscriptions' && p.description?.toLowerCase().includes('subscription')));
    if (payments.length === 0) return <p className="text-muted-foreground text-sm text-center py-3">No payments for {category}.</p>;
    return (
      <ul className="space-y-1.5 text-sm pr-2">
        {payments.slice().reverse().map((item, i) => (
          <li key={i} className="p-1.5 rounded bg-amber-500/10">
            <div className="flex justify-between">
              <span className="text-foreground/90">{item.description}</span>
              <span className="text-amber-700">₹{item.amount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    );
  };


  return (
    <Tabs defaultValue="myAccount" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4 bg-primary/10"> {/* Changed grid-cols-3 to grid-cols-2 */}
        <TabsTrigger value="myAccount" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Account</TabsTrigger>
        <TabsTrigger value="specialPayments" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Special Payments</TabsTrigger>
      </TabsList>
      <TabsContent value="myAccount">
        <Card>
          <CardHeader>
            <CardTitle>My Account Balance</CardTitle>
            <CardDescription>Current Balance: <span className={`font-bold ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{totalBalance.toFixed(2)}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <ul className="space-y-1.5 text-sm pr-2">
                {studentCashAccount.myAccount.slice().reverse().map((item, i) => (
                  <li key={i} className={`p-1.5 rounded ${item.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <div className="flex justify-between">
                      <span className="text-foreground/90">{item.description}</span>
                      <span className={item.amount >=0 ? 'text-green-600' : 'text-red-600'}>{item.amount >=0 ? '+':'-'}₹{Math.abs(item.amount).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                  </li>
                ))}
                {studentCashAccount.myAccount.length === 0 && <p className="text-center text-muted-foreground py-4">No account transactions.</p>}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="specialPayments">
        <Card>
          <CardHeader><CardTitle>Committee Dues & Subscriptions</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="Bakkala" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-3 bg-secondary/30">
                {specialPaymentCategories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="py-2 text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">{cat}</TabsTrigger>
                ))}
              </TabsList>
              {specialPaymentCategories.map(cat => (
                <TabsContent key={cat} value={cat}>
                  <ScrollArea className="h-[200px]">
                    {renderSpecialPayments(cat)}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default StudentCashAccountTab;