import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { Save, PlusCircle, Edit, Trash } from 'lucide-react';

const CompetitionPointsManagement = () => {
  const { toast } = useToast();
  const [competitionPoints, setCompetitionPoints] = useState(loadData('competitionPoints', []));
  const [compName, setCompName] = useState('');
  const [compPoints, setCompPoints] = useState('');
  const [editingCompId, setEditingCompId] = useState(null);

  useEffect(() => { saveData('competitionPoints', competitionPoints); }, [competitionPoints]);

  const saveCompetitionPoints = () => {
    if (!compName.trim() || !compPoints) {
      toast({ variant: "destructive", title: "Error", description: "Competition name and points are required." });
      return;
    }
    const numPoints = parseInt(compPoints, 10);
    if (isNaN(numPoints)) {
      toast({ variant: "destructive", title: "Error", description: "Points must be a number." });
      return;
    }
    if (editingCompId) {
      setCompetitionPoints(prev => prev.map(c => c.id === editingCompId ? { ...c, name: compName, points: numPoints } : c));
      toast({ title: "Success", description: "Competition points updated.", className: "bg-green-500 text-white" });
    } else {
      setCompetitionPoints(prev => [...prev, { id: Date.now().toString(), name: compName, points: numPoints }]);
      toast({ title: "Success", description: "Competition points added.", className: "bg-green-500 text-white" });
    }
    setCompName(''); setCompPoints(''); setEditingCompId(null);
  };

  const editCompetition = (comp) => {
    setEditingCompId(comp.id);
    setCompName(comp.name);
    setCompPoints(comp.points.toString());
  };

  const deleteCompetition = (id) => {
    setCompetitionPoints(prev => prev.filter(c => c.id !== id));
    toast({ title: "Success", description: "Competition points deleted.", className: "bg-red-500 text-white" });
  };

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary/90">{editingCompId ? 'Edit Competition' : 'Add Competition Points'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 h-[calc(100%-4rem)] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2 space-y-0.5">
            <Label htmlFor="compNameMaster" className="text-xs text-muted-foreground">Competition Name</Label>
            <Input id="compNameMaster" value={compName} onChange={(e) => setCompName(e.target.value)} className="mt-0.5 text-sm" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="compPointsMaster" className="text-xs text-muted-foreground">Points</Label>
            <Input id="compPointsMaster" type="number" value={compPoints} onChange={(e) => setCompPoints(e.target.value)} className="mt-0.5 text-sm" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveCompetitionPoints} className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">
            {editingCompId ? <><Save className="mr-1 sm:mr-2 h-4 w-4" />Update</> : <><PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />Add Comp.</>}
          </Button>
          {editingCompId && <Button variant="outline" onClick={() => {setEditingCompId(null); setCompName(''); setCompPoints('');}} className="text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">Cancel</Button>}
        </div>
        <h3 className="text-md sm:text-lg font-semibold pt-2 text-primary/80">Competition Points List</h3>
        <ScrollArea className="flex-grow pr-2">
          <ul className="space-y-1.5">
            {competitionPoints.map(comp => (
              <li key={comp.id} className="p-2 sm:p-3 bg-background/50 dark:bg-background/40 rounded-md shadow-sm flex justify-between items-center text-xs sm:text-sm">
                <span className="text-foreground">{comp.name}</span>
                <div className="flex items-center">
                  <span className="font-semibold text-primary mr-2 sm:mr-4">{comp.points} points</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 hover:text-blue-600" onClick={() => editCompetition(comp)}><Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 hover:text-red-600" onClick={() => deleteCompetition(comp.id)}><Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                </div>
              </li>
            ))}
            {competitionPoints.length === 0 && <p className="text-center text-muted-foreground py-6">No competition points defined.</p>}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CompetitionPointsManagement;