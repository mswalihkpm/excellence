import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { studentNames } from '@/lib/students';
import { PlusCircle, Send, Paperclip, Mic, Users, MessageSquare, Video, Smile, FileText, Search, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const publicGroupNames = ["SAMAJAM", "COMPASS", "EXCELLENTIA", "CLEANY ISHA'ATH", "MULTHAQA"];
const reactionEmojis = ['👍', '❤️', '😂', '😢', '😮', '😡'];

const ChatGroupPage = ({ user }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState(loadData('chatGroups', 
    publicGroupNames.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name, members: ['all'], messages: [], isPublic: true }))
  ));
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const messagesEndRef = useRef(null);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    saveData('chatGroups', groups);
  }, [groups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Group name and at least one member (other than self) are required." });
      return;
    }
    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      members: [...selectedMembers, user.name], 
      messages: [],
      isPublic: false,
      createdBy: user.name,
    };
    setGroups(prev => [...prev, newGroup]);
    toast({ title: "Group Created", description: `Group "${newGroup.name}" created successfully.`, className: "bg-green-500 text-white" });
    setNewGroupName('');
    setSelectedMembers([]);
    setShowCreateGroupDialog(false);
  };
  
  const handleMemberSelect = (studentName) => {
    setSelectedMembers(prev => 
      prev.includes(studentName) ? prev.filter(m => m !== studentName) : [...prev, studentName]
    );
  };

  const handleSendMessage = (type = 'text', content = newMessage) => {
    if (!content.trim() || !selectedGroup) return;
    const message = {
      id: Date.now().toString(),
      sender: user.name,
      text: type === 'text' ? content.trim() : `Simulated ${type}: ${content}`,
      timestamp: new Date().toISOString(),
      type: type,
      reactions: {}, // { emoji: [user1, user2] }
    };
    setGroups(prevGroups => prevGroups.map(group => 
      group.id === selectedGroup.id ? { ...group, messages: [...group.messages, message] } : group
    ));
    if (type === 'text') setNewMessage('');
    if (type !== 'text') toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Sent (Simulated)`, description: `Your ${type} has been added to the chat.`, className: "bg-blue-500 text-white" });
  };

  const handleDeleteMessage = (messageId) => {
    if (!selectedGroup) return;
    setGroups(prevGroups => prevGroups.map(group => {
      if (group.id === selectedGroup.id) {
        return { ...group, messages: group.messages.filter(msg => msg.id !== messageId) };
      }
      return group;
    }));
    toast({ title: "Message Deleted", description: "Your message has been removed.", className: "bg-orange-500 text-white" });
  };

  const handleReaction = (messageId, emoji) => {
    if (!selectedGroup) return;
    setGroups(prevGroups => prevGroups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          messages: group.messages.map(msg => {
            if (msg.id === messageId) {
              const newReactions = { ...(msg.reactions || {}) };
              if (newReactions[emoji]?.includes(user.name)) {
                // User is removing their reaction
                newReactions[emoji] = newReactions[emoji].filter(name => name !== user.name);
                if (newReactions[emoji].length === 0) delete newReactions[emoji];
              } else {
                // User is adding a reaction
                newReactions[emoji] = [...(newReactions[emoji] || []), user.name];
              }
              return { ...msg, reactions: newReactions };
            }
            return msg;
          })
        };
      }
      return group;
    }));
  };
  
  const filteredStudentNames = studentNames.filter(name => name.toLowerCase().includes(studentSearchTerm.toLowerCase()));
  const userGroups = groups.filter(group => 
    (group.isPublic || group.members.includes(user.name)) && 
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y:10 }}
      animate={{ opacity: 1, y:0 }}
      transition={{ duration: 0.5 }}
      className="flex h-full max-h-[calc(100vh-8rem)] md:max-h-[calc(100vh-10rem)] rounded-lg overflow-hidden shadow-xl bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-pink-600/20 dark:from-purple-800/30 dark:via-indigo-800/30 dark:to-pink-800/30"
    >
      <aside className="w-1/3 md:w-1/4 border-r border-border/30 p-3 bg-background/50 dark:bg-background/40 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-primary/90">Groups</h2>
          {user.type === 'master' && (
            <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="bg-primary/10 hover:bg-primary/20 border-primary/30"><PlusCircle className="h-4 w-4 text-primary"/></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
                <DialogHeader><DialogTitle>Create New Group</DialogTitle></DialogHeader>
                <div className="space-y-3 py-3">
                  <Input placeholder="Group Name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                  <p className="text-sm font-medium text-muted-foreground">Select Members:</p>
                  <Input placeholder="Search students..." value={studentSearchTerm} onChange={e => setStudentSearchTerm(e.target.value)} className="mb-1 h-8 text-xs" />
                  <ScrollArea className="h-[180px] border rounded-md p-2">
                    {filteredStudentNames.map(name => (
                      <div key={name} className="flex items-center space-x-2 py-1">
                        <Checkbox id={`member-${name}`} checked={selectedMembers.includes(name)} onCheckedChange={() => handleMemberSelect(name)} />
                        <Label htmlFor={`member-${name}`} className="text-sm font-normal">{name}</Label>
                      </div>
                    ))}
                     {filteredStudentNames.length === 0 && <p className="text-xs text-muted-foreground text-center">No students match search.</p>}
                  </ScrollArea>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateGroup} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Input placeholder="Search groups..." value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} className="mb-2 h-8 text-xs" />
        <ScrollArea className="h-[calc(100%-6rem)]">
          <ul className="space-y-1.5">
            {userGroups.map(group => (
              <li key={group.id}>
                <Button
                  variant={selectedGroup?.id === group.id ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 text-sm ${selectedGroup?.id === group.id ? 'bg-primary/20 text-primary' : 'hover:bg-primary/5'}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group.isPublic ? <Users className="mr-2 h-4 w-4 text-blue-400"/> : <MessageSquare className="mr-2 h-4 w-4 text-purple-400"/>}
                  {group.name}
                </Button>
              </li>
            ))}
             {userGroups.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">No groups match search or available.</p>}
          </ul>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-card/70 dark:bg-card/60 p-1 sm:p-2 md:p-3 backdrop-blur-sm">
        {selectedGroup ? (
          <>
            <header className="p-2 border-b border-border/30 mb-2 bg-background/20 rounded-t-md">
              <h3 className="text-md font-semibold text-primary">{selectedGroup.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedGroup.isPublic ? "Public Group" : `Members: ${selectedGroup.members.slice(0,3).join(', ')}${selectedGroup.members.length > 3 ? '...' : ''}`}
              </p>
            </header>
            <ScrollArea className="flex-grow mb-2 p-2 bg-background/30 rounded-md shadow-inner">
              <div className="space-y-3"> 
                {selectedGroup.messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No messages in this group yet. Start the conversation!</p>}
                {selectedGroup.messages.map(msg => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity:0, y: 5}} animate={{ opacity:1, y:0 }} transition={{duration:0.3}}
                    className={`group relative flex ${msg.sender === user.name ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md p-2.5 rounded-xl shadow-md ${msg.sender === user.name ? 'bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'}`}>
                      <p className="text-xs font-semibold mb-0.5 opacity-90">{msg.sender === user.name ? "You" : msg.sender}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      {Object.keys(msg.reactions || {}).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(msg.reactions).map(([emoji, usersReacted]) => (
                            usersReacted.length > 0 && (
                              <span key={emoji} className="text-xs px-1.5 py-0.5 bg-background/30 rounded-full cursor-default" title={usersReacted.join(', ')}>
                                {emoji} {usersReacted.length}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className={`absolute top-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${msg.sender === user.name ? 'left-[-28px]' : 'right-[-28px]'}`}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><Smile className="h-3.5 w-3.5"/></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1 bg-background/80 backdrop-blur-md shadow-lg border-border/50">
                                <div className="flex space-x-0.5">
                                    {reactionEmojis.map(emoji => (
                                        <Button key={emoji} variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" onClick={() => handleReaction(msg.id, emoji)}>
                                            <span className="text-sm">{emoji}</span>
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                         {msg.sender === user.name && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleDeleteMessage(msg.id)}>
                                <Trash2 className="h-3.5 w-3.5"/>
                            </Button>
                        )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="mt-auto flex items-center space-x-1.5 p-1 border-t border-border/30 pt-2 bg-background/20 rounded-b-md">
              <Button variant="ghost" size="icon" onClick={() => handleSendMessage('image', 'sample_image.jpg')}><Paperclip className="h-5 w-5 text-muted-foreground hover:text-primary"/></Button>
              <Button variant="ghost" size="icon" onClick={() => handleSendMessage('video', 'sample_video.mp4')}><Video className="h-5 w-5 text-muted-foreground hover:text-primary"/></Button>
              <Button variant="ghost" size="icon" onClick={() => handleSendMessage('file', 'document.pdf')}><FileText className="h-5 w-5 text-muted-foreground hover:text-primary"/></Button>
              <Input 
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-grow h-10 text-sm bg-background/50 focus:bg-background/70"
              />
              <Button variant="ghost" size="icon" onClick={() => handleSendMessage('voice', 'voice_message.mp3')}><Mic className="h-5 w-5 text-muted-foreground hover:text-primary"/></Button>
              <Button onClick={() => handleSendMessage()} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"><Send className="h-4 w-4"/></Button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-center p-4">
            <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} transition={{delay:0.2, duration:0.4}}>
                <MessageSquare className="h-16 w-16 text-primary/30 mx-auto mb-3"/>
                <p className="text-muted-foreground">Select a group to start chatting <br/> or create a new one if you're a master.</p>
            </motion.div>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default ChatGroupPage;