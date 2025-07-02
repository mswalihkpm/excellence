import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { PlusCircle, Edit3, Trash2, CalendarDays, Palette, Bold, Italic } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const defaultColors = ['#FFFFFF', '#FECACA', '#FED7AA', '#FEF08A', '#D9F99D', '#BFDBFE', '#DDD6FE', '#FBCFE8'];


const CircularPage = ({ user }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState(loadData('circularEvents', [])); // { id, date, title, description }
  const [dateStyles, setDateStyles] = useState(loadData('circularDateStyles', {})); // { 'YYYY-MM-DD': { color, bold, italic, bgColor } }
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); 
  const [newEvent, setNewEvent] = useState({ date: '', title: '', description: '' });

  const canManageCircularAdvanced = user.type === 'master' || (user.type === 'mhs' && (user.role === 'president' || user.role === 'secretary'));
  const canAddEvents = user.type === 'mhs' && user.role === 'president';

  useEffect(() => { saveData('circularEvents', events); }, [events]);
  useEffect(() => { saveData('circularDateStyles', dateStyles); }, [dateStyles]);

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEvent = () => {
    if (!newEvent.date || !newEvent.title.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Event date and title are required." });
      return;
    }
    if (editingEvent) {
      setEvents(prevEvents => prevEvents.map(event => event.id === editingEvent.id ? { ...editingEvent, ...newEvent } : event));
      toast({ title: "Event Updated", description: `Event "${newEvent.title}" updated.`, className: "bg-green-500 text-white" });
    } else {
      setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now().toString() }]);
      toast({ title: "Event Added", description: `Event "${newEvent.title}" added to circular.`, className: "bg-green-500 text-white" });
    }
    setShowAddEventDialog(false);
    setNewEvent({ date: '', title: '', description: '' });
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({ ...event });
    setShowAddEventDialog(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    toast({ title: "Event Deleted", description: `Event removed from circular.`, className: "bg-red-500 text-white" });
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };
  
  const applyDateStyle = (dateStr, styleType, value) => {
    setDateStyles(prev => {
        const newStyles = { ...prev };
        if (!newStyles[dateStr]) newStyles[dateStr] = {};
        
        if (styleType === 'color' || styleType === 'bgColor') {
            newStyles[dateStr][styleType] = value;
        } else { // bold, italic (toggle)
            newStyles[dateStr][styleType] = !newStyles[dateStr][styleType];
        }
        return newStyles;
    });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingEmptyDays = Array.from({ length: firstDayOfMonth });

  return (
    <ScrollArea className="h-full p-1">
      <Card className="max-w-4xl mx-auto shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-primary/90">Circular & Events Calendar</CardTitle>
            {canAddEvents && (
              <Dialog open={showAddEventDialog} onOpenChange={(isOpen) => {
                  setShowAddEventDialog(isOpen); 
                  if (!isOpen) { setEditingEvent(null); setNewEvent({ date: '', title: '', description: '' });}
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"><PlusCircle className="mr-2 h-4 w-4"/>Add Event</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-3">
                    <Label htmlFor="eventDate">Date</Label><Input id="eventDate" name="date" type="date" value={newEvent.date} onChange={handleEventInputChange} />
                    <Label htmlFor="eventTitle">Title</Label><Input id="eventTitle" name="title" value={newEvent.title} onChange={handleEventInputChange} />
                    <Label htmlFor="eventDescription">Description (Optional)</Label><Textarea id="eventDescription" name="description" value={newEvent.description} onChange={handleEventInputChange} rows={3}/>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setShowAddEventDialog(false); setEditingEvent(null); setNewEvent({ date: '', title: '', description: '' }); }}>Cancel</Button>
                    <Button onClick={handleSaveEvent}>{editingEvent ? 'Save Changes' : 'Add Event'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <CardDescription>View upcoming events and important dates. Authorized users can manage events and styles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 p-2 bg-background/40 rounded-md">
            <Button variant="outline" onClick={() => changeMonth(-1)}>Previous</Button>
            <h3 className="text-lg font-semibold text-primary">{months[currentMonth]} {currentYear}</h3>
            <Button variant="outline" onClick={() => changeMonth(1)}>Next</Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground border-b pb-1 mb-1">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {leadingEmptyDays.map((_, i) => <div key={`empty-${i}`} className="border rounded-md aspect-square"></div>)}
            {calendarDays.map(day => {
              const dayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dayDateStr);
              const styles = dateStyles[dayDateStr] || {};
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
              
              let dayClasses = "border rounded-md p-1.5 aspect-square flex flex-col items-start relative text-xs hover:bg-accent/20";
              if (isToday && !styles.bgColor) dayClasses += ' bg-primary/10 border-primary/50';
              else if (!styles.bgColor) dayClasses += ' bg-background/30';

              let dayStyle = {
                color: styles.color,
                backgroundColor: styles.bgColor,
                fontWeight: styles.bold ? 'bold' : 'normal',
                fontStyle: styles.italic ? 'italic' : 'normal',
              };

              return (
                <div key={day} className={dayClasses} style={dayStyle}>
                  <div className="flex justify-between w-full items-start">
                    <span className={`font-medium ${isToday && !styles.color ? 'text-primary font-bold' : (styles.color ? '' : 'text-foreground')}`}>{day}</span>
                    {canManageCircularAdvanced && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-4 w-4 p-0 opacity-50 hover:opacity-100"><Palette className="h-3 w-3"/></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2 space-y-1.5 bg-background/90 backdrop-blur-sm shadow-lg border-border/50">
                                <div className="grid grid-cols-4 gap-1">
                                    {defaultColors.map(color => (
                                        <Button key={color} style={{backgroundColor: color}} className="h-5 w-5 rounded-sm border border-border/30" onClick={() => applyDateStyle(dayDateStr, 'bgColor', color)} />
                                    ))}
                                </div>
                                <Input type="color" value={styles.color || '#000000'} onChange={(e) => applyDateStyle(dayDateStr, 'color', e.target.value)} className="h-7 w-full p-0.5"/>
                                <div className="flex space-x-1">
                                    <Button variant={styles.bold ? "secondary" : "outline"} size="xs" onClick={() => applyDateStyle(dayDateStr, 'bold')}><Bold className="h-3 w-3"/></Button>
                                    <Button variant={styles.italic ? "secondary" : "outline"} size="xs" onClick={() => applyDateStyle(dayDateStr, 'italic')}><Italic className="h-3 w-3"/></Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <ScrollArea className="h-[calc(100%-1.5rem)] w-full mt-0.5">
                      <ul className="space-y-0.5">
                        {dayEvents.map(event => (
                          <li key={event.id} className="bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[0.6rem] px-1 rounded-sm truncate" title={event.title}>{event.title}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </div>
              );
            })}
          </div>
          
          <h3 className="text-lg font-semibold text-primary/80 mt-6 mb-2">Events List for {months[currentMonth]} {currentYear}</h3>
          <ScrollArea className="h-[200px] border rounded-md p-3 bg-background/30">
            {events.filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear).sort((a,b) => new Date(a.date) - new Date(b.date)).length === 0 && 
              <p className="text-center text-muted-foreground py-4">No events scheduled for this month.</p>}
            <ul className="space-y-2">
              {events
                .filter(e => new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear)
                .sort((a,b) => new Date(a.date) - new Date(b.date))
                .map(event => (
                <li key={event.id} className="p-2 bg-background/50 rounded-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{event.title} <span className="text-xs text-muted-foreground">({new Date(event.date).toLocaleDateString()})</span></h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                    </div>
                    {canAddEvents && ( // Only President can edit/delete events for now based on "canManageCircular" not being enough
                      <div className="flex space-x-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)} className="text-blue-500 hover:text-blue-600 h-6 w-6"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:text-red-600 h-6 w-6"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};

export default CircularPage;