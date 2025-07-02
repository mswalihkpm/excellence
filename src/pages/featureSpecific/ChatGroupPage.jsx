import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { studentNames } from '@/lib/students';
import {
  PlusCircle,
  Send,
  Paperclip,
  Mic,
  Users,
  MessageSquare,
  Video,
  Smile,
  FileText,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const publicGroupNames = ["SAMAJAM", "COMPASS", "EXCELLENTIA", "CLEANY ISHA'ATH", "MULTHAQA"];
const reactionEmojis = ['👍', '❤️', '😂', '😢', '😮', '😡'];

const ChatGroupPage = ({ user }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState(loadData('chatGroups',
    publicGroupNames.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      members: ['all'],
      messages: [],
      isPublic: true
    }))
  ));

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    saveData('chatGroups', groups);
  }, [groups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  const handleSendMessage = (type = 'text', content = newMessage) => {
    if (!selectedGroup || !content.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: user.name,
      type,
      text: type === 'text' ? content.trim() : '',
      content: type !== 'text' ? content : '',
      timestamp: new Date().toISOString(),
      reactions: {}
    };

    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, messages: [...group.messages, message] }
          : group
      )
    );

    if (type === 'text') setNewMessage('');
    toast({
      title: `Sent ${type}`,
      description: `${type} message sent`,
      className: "bg-blue-500 text-white"
    });
  };

  const handleDeleteMessage = (id) => {
    if (!selectedGroup) return;
    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, messages: group.messages.filter(m => m.id !== id) }
          : group
      )
    );
  };

  const handleReaction = (id, emoji) => {
    if (!selectedGroup) return;
    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? {
              ...group,
              messages: group.messages.map(msg => {
                if (msg.id === id) {
                  const reactions = { ...msg.reactions };
                  if (reactions[emoji]?.includes(user.name)) {
                    reactions[emoji] = reactions[emoji].filter(n => n !== user.name);
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                  } else {
                    reactions[emoji] = [...(reactions[emoji] || []), user.name];
                  }
                  return { ...msg, reactions };
                }
                return msg;
              })
            }
          : group
      )
    );
  };

  return (
    <motion.div className="flex h-full">
      <aside className="w-1/4 p-3 border-r border-border">
        <h2 className="font-bold mb-2">Groups</h2>
        <ScrollArea className="h-full">
          {groups.map(group => (
            <Button
              key={group.id}
              variant={selectedGroup?.id === group.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => setSelectedGroup(group)}
            >
              {group.name}
            </Button>
          ))}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col p-3">
        {selectedGroup ? (
          <>
            <ScrollArea className="flex-grow mb-3">
              {selectedGroup.messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <div className="p-2 rounded-md shadow bg-purple-600 text-white">
                    <p className="text-xs">{msg.sender}</p>

                    {msg.type === 'text' && <p>{msg.text}</p>}
                    {msg.type === 'image' && (
                      <img src={msg.content} alt="sent" className="max-w-xs" />
                    )}
                    {msg.type === 'video' && (
                      <video controls src={msg.content} className="max-w-xs" />
                    )}
                    {msg.type === 'voice' && (
                      <audio controls src={msg.content}></audio>
                    )}
                    {msg.type === 'file' && (
                      <a href={msg.content} download className="underline">Download File</a>
                    )}

                    <div className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef}></div>
            </ScrollArea>

            <div className="flex items-center gap-2 border-t pt-2">
              <Button onClick={() => handleSendMessage('image', '/path/to/sample.jpg')}>
                <Paperclip />
              </Button>
              <Button onClick={() => handleSendMessage('video', '/path/to/video.mp4')}>
                <Video />
              </Button>
              <Button onClick={() => handleSendMessage('voice', '/path/to/voice.mp3')}>
                <Mic />
              </Button>
              <Button onClick={() => handleSendMessage('file', '/path/to/file.pdf')}>
                <FileText />
              </Button>

              <Input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={() => handleSendMessage()}>
                <Send />
              </Button>
            </div>
          </>
        ) : (
          <p>Select a group to start chatting</p>
        )}
      </main>
    </motion.div>
  );
};

export default ChatGroupPage;
