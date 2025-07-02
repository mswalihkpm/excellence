import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { Save, PlusCircle, Edit, Trash } from 'lucide-react';

const EventsManagement = () => {
  const { toast } = useToast();
  const [upcomingEvents, setUpcomingEvents] = useState(loadData('upcomingEvents', []));
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  useEffect(() => { saveData('upcomingEvents', upcomingEvents); }, [upcomingEvents]);

  const saveEvent = () => {
    if (!eventName.trim() || !eventDescription.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Event name and description are required." });
      return;
    }
    if (editingEventId) {
      setUpcomingEvents(prev => prev.map(e => e.id === editingEventId ? { ...e, name: eventName, date: eventDate, description: eventDescription } : e));
      toast({ title: "Success", description: "Event updated.", className: "bg-green-500 text-white" });
    } else {
      setUpcomingEvents(prev => [...prev, { id: Date.now().toString(), name: eventName, date: eventDate, description: eventDescription }]);
      toast({ title: "Success", description: "Event added.", className: "bg-green-500 text-white" });
    }
    setEventName(''); setEventDate(''); setEventDescription(''); setEditingEventId(null);
  };

  const editEvent = (event) => {
    setEditingEventId(event.id);
    setEventName(event.name);
    setEventDate(event.date || '');
    setEventDescription(event.description);
  };

  const deleteEvent = (id) => {
    setUpcomingEvents(prev => prev.filter(e => e.id !== id));
    toast({ title: "Success", description: "Event deleted.", className: "bg-red-500 text-white" });
  };

  return (
    <Card className="bg-card/80 dark:bg-card/70 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary/90">{editingEventId ? 'Edit Event' : 'Add Upcoming Event'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 h-[calc(100%-4rem)] flex flex-col">
        <div className="space-y-2">
          <div>
            <Label htmlFor="eventNameMaster" className="text-xs text-muted-foreground">Event Name</Label>
            <Input id="eventNameMaster" value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-0.5 text-sm" />
          </div>
          <div>
            <Label htmlFor="eventDateMaster" className="text-xs text-muted-foreground">Event Date (Optional)</Label>
            <Input id="eventDateMaster" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-0.5 text-sm" />
          </div>
          <div>
            <Label htmlFor="eventDescriptionMaster" className="text-xs text-muted-foreground">Description</Label>
            <Textarea id="eventDescriptionMaster" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="mt-0.5 text-sm min-h-[60px]" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={saveEvent} className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">
            {editingEventId ? <><Save className="mr-1 sm:mr-2 h-4 w-4" />Update</> : <><PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />Add Event</>}
          </Button>
          {editingEventId && <Button variant="outline" onClick={() => {setEditingEventId(null); setEventName(''); setEventDate(''); setEventDescription('');}} className="text-xs px-3 py-1.5 sm:text-sm sm:px-4 sm:py-2 h-auto">Cancel</Button>}
        </div>

        <h3 className="text-md sm:text-lg font-semibold pt-2 text-primary/80">Current Events</h3>
        <ScrollArea className="flex-grow pr-2">
          <ul className="space-y-1.5">
            {upcomingEvents.map(event => (
              <li key={event.id} className="p-2 sm:p-3 bg-background/50 dark:bg-background/40 rounded-md shadow-sm flex justify-between items-start text-xs sm:text-sm">
                <div>
                  <h4 className="font-semibold text-foreground">{event.name}</h4>
                  {event.date && <p className="text-xs text-muted-foreground">Date: {new Date(event.date).toLocaleDateString()}</p>}
                  <p className="text-foreground/80 mt-0.5 whitespace-pre-wrap">{event.description}</p>
                </div>
                <div className="flex space-x-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 hover:text-blue-600" onClick={() => editEvent(event)}><Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 hover:text-red-600" onClick={() => deleteEvent(event.id)}><Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                </div>
              </li>
            ))}
            {upcomingEvents.length === 0 && <p className="text-center text-muted-foreground py-6">No upcoming events.</p>}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventsManagement;