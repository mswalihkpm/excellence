import React, { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Input, ScrollArea, Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
  Checkbox, Label, Popover, PopoverContent, PopoverTrigger
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { studentNames } from '@/lib/students';
import {
  PlusCircle, Send, Paperclip, Mic, Users, MessageSquare,
  Video, Smile, FileText, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const publicGroupNames = ["SAMAJAM", "COMPASS", "EXCELLENTIA", "CLEANY ISHA'ATH", "MULTHAQA"];
const reactionEmojis = ['👍', '❤️', '😂', '😢', '😮', '😡'];

const ChatGroupPage = ({ user }) => {
  const { toast } = useToast();

  const [groups, setGroups] = useState(
    loadData('chatGroups',
      publicGroupNames.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        members: ['all'],
        messages: [],
        isPublic: true
      }))
    )
  );
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    saveData('chatGroups', groups);
  }, [groups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Group name and at least one member are required."
      });
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
    toast({ title: "Group Created", description: `Group "${newGroup.name}" created.` });
    setNewGroupName('');
    setSelectedMembers([]);
    setShowCreateGroupDialog(false);
  };

  const handleMemberSelect = (name) => {
    setSelectedMembers(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  const handleSendMessage = (type = 'text', content = newMessage) => {
    if (!selectedGroup) return;

    let message = {
      id: Date.now().toString(),
      sender: user.name,
      timestamp: new Date().toISOString(),
      type,
      reactions: {}
    };

    if (type === 'text') {
      if (!content.trim()) return;
      message.text = content.trim();
      setNewMessage('');
    } else {
      message.file = content; // will be a base64 string or URL
    }

    setGroups(prev => prev.map(group =>
      group.id === selectedGroup.id ? {
        ...group,
        messages: [...group.messages, message]
      } : group
    ));
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleSendMessage(fileType, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = (messageId) => {
    if (!selectedGroup) return;
    setGroups(prev => prev.map(group =>
      group.id === selectedGroup.id
        ? { ...group, messages: group.messages.filter(m => m.id !== messageId) }
        : group
    ));
  };

  const handleReaction = (messageId, emoji) => {
    if (!selectedGroup) return;
    setGroups(prev => prev.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          messages: group.messages.map(msg => {
            if (msg.id === messageId) {
              const newReactions = { ...msg.reactions };
              if (newReactions[emoji]?.includes(user.name)) {
                newReactions[emoji] = newReactions[emoji].filter(n => n !== user.name);
                if (newReactions[emoji].length === 0) delete newReactions[emoji];
              } else {
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

  const filteredStudentNames = studentNames.filter(name =>
    name.toLowerCase().includes(studentSearchTerm.toLowerCase()));
  const userGroups = groups.filter(group =>
    (group.isPublic || group.members.includes(user.name)) &&
    group.name.toLowerCase().includes(groupSearchTerm.toLowerCase()));

  return (
    <motion.div className="flex h-full">
      {/* Sidebar */}
      {/* Your sidebar code remains unchanged ... */}

      <main className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            <ScrollArea className="flex-grow p-3">
              {selectedGroup.messages.map(msg => (
                <div key={msg.id} className="mb-2">
                  <p><strong>{msg.sender}:</strong></p>
                  {msg.type === 'text' && <p>{msg.text}</p>}
                  {msg.type === 'image' && <img src={msg.file} alt="sent img" className="w-40 rounded" />}
                  {msg.type === 'video' && (
                    <video controls src={msg.file} className="w-60 rounded" />
                  )}
                  {msg.type === 'voice' && (
                    <audio controls src={msg.file} />
                  )}
                  {msg.type === 'file' && (
                    <a href={msg.file} download>Download file</a>
                  )}
                  <div>
                    {reactionEmojis.map(e => (
                      <button key={e} onClick={() => handleReaction(msg.id, e)}>
                        {e}
                      </button>
                    ))}
                    <button onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-2 border-t flex space-x-2">
              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={() => handleSendMessage()}>Send</Button>

              <label>
                <Paperclip />
                <input type="file" accept="image/*" hidden onChange={e => handleFileUpload(e, 'image')} />
              </label>
              <label>
                <Video />
                <input type="file" accept="video/*" hidden onChange={e => handleFileUpload(e, 'video')} />
              </label>
              <label>
                <Mic />
                <input type="file" accept="audio/*" hidden onChange={e => handleFileUpload(e, 'voice')} />
              </label>
              <label>
                <FileText />
                <input type="file" hidden onChange={e => handleFileUpload(e, 'file')} />
              </label>
            </div>
          </>
        ) : (
          <div>Select a group to chat</div>
        )}
      </main>
    </motion.div>
  );
};

export default ChatGroupPage;
