import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { studentNames } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { Users, PlusCircle, Edit3, Trash2, Award, ShieldCheck, Search } from 'lucide-react';

const TeamManagementPage = ({ user }) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState(loadData('teamsData', [])); // [{ id, name, members: [], points: 0 }]
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teamPoints, setTeamPoints] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isSecretary = user.type === 'mhs' && user.role === 'secretary';

  useEffect(() => {
    saveData('teamsData', teams);
  }, [teams]);

  const handleCreateOrUpdateTeam = () => {
    if (!teamName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Team name is required." });
      return;
    }
    const pointsNum = teamPoints ? parseInt(teamPoints, 10) : 0;
    if (teamPoints && (isNaN(pointsNum) || pointsNum < 0)) {
        toast({ variant: "destructive", title: "Error", description: "Points must be a non-negative number." });
        return;
    }

    if (editingTeam) {
      setTeams(prevTeams => prevTeams.map(t => t.id === editingTeam.id ? { ...t, name: teamName, members: selectedStudents, points: pointsNum } : t));
      toast({ title: "Team Updated", description: `${teamName} updated successfully.`, className: "bg-green-500 text-white" });
    } else {
      setTeams(prevTeams => [...prevTeams, { id: Date.now().toString(), name: teamName, members: selectedStudents, points: pointsNum }]);
      toast({ title: "Team Created", description: `${teamName} created successfully.`, className: "bg-green-500 text-white" });
    }
    resetForm();
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelectedStudents(team.members || []);
    setTeamPoints(team.points ? team.points.toString() : '');
    setShowCreateTeamDialog(true);
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(prevTeams => prevTeams.filter(t => t.id !== teamId));
    toast({ title: "Team Deleted", description: "Team removed successfully.", className: "bg-red-500 text-white" });
  };

  const resetForm = () => {
    setShowCreateTeamDialog(false);
    setEditingTeam(null);
    setTeamName('');
    setSelectedStudents([]);
    setTeamPoints('');
  };

  const toggleStudentInSelection = (studentName) => {
    setSelectedStudents(prev => 
      prev.includes(studentName) ? prev.filter(s => s !== studentName) : [...prev, studentName]
    );
  };
  
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollArea className="h-full p-1">
      <Card className="shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-sm min-h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-primary/90 flex items-center"><ShieldCheck className="mr-2 h-7 w-7"/>Team Management</CardTitle>
            {isSecretary && (
              <Button size="sm" onClick={() => { resetForm(); setShowCreateTeamDialog(true); }} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <PlusCircle className="mr-2 h-4 w-4"/>Create New Team
              </Button>
            )}
          </div>
          <CardDescription>
            {isSecretary ? "Create, edit, and manage student teams and their points." : "View team compositions and points."}
          </CardDescription>
          <div className="mt-3 relative">
            <Input 
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm h-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredTeams.length === 0 && <p className="text-center text-muted-foreground py-8">No teams found or created yet.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map(team => (
              <Card key={team.id} className="bg-background/50 shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-primary">{team.name}</CardTitle>
                    {isSecretary && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600" onClick={() => handleEditTeam(team)}><Edit3 className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteTeam(team.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm font-semibold text-amber-600">{team.points || 0} Points</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-1">Members ({team.members?.length || 0}):</p>
                  <ScrollArea className="h-[80px] text-xs border bg-background/30 p-1.5 rounded-sm">
                    {team.members && team.members.length > 0 ? team.members.join(', ') : 'No members assigned.'}
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {isSecretary && showCreateTeamDialog && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={resetForm}>
            <Card className="w-full max-w-lg z-50 shadow-xl bg-card" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                    <CardTitle className="text-xl text-primary">{editingTeam ? 'Edit Team' : 'Create New Team'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <Label htmlFor="teamNameDialog">Team Name</Label>
                        <Input id="teamNameDialog" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Select Members</Label>
                        <ScrollArea className="h-[150px] border rounded-md p-2 mt-1">
                            <div className="grid grid-cols-2 gap-1.5">
                            {studentNames.map(student => (
                                <Button 
                                    key={student} 
                                    variant={selectedStudents.includes(student) ? "secondary" : "outline"}
                                    size="sm"
                                    className="text-xs h-auto py-1.5 justify-start"
                                    onClick={() => toggleStudentInSelection(student)}
                                >
                                    {student}
                                </Button>
                            ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div>
                        <Label htmlFor="teamPointsDialog">Team Points (Rank Order)</Label>
                        <Input id="teamPointsDialog" type="number" value={teamPoints} onChange={(e) => setTeamPoints(e.target.value)} placeholder="e.g., 100"/>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button onClick={handleCreateOrUpdateTeam} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                        {editingTeam ? 'Save Changes' : 'Create Team'}
                    </Button>
                </CardFooter>
            </Card>
         </div>
      )}
    </ScrollArea>
  );
};

export default TeamManagementPage;