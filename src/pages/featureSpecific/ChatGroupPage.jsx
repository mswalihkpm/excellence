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
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import {
  Paperclip,
  Send,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const publicGroupNames = ["സമാജം", "COMPASS", "EXCELLENTIA", "CLEANY ISHA'ATH", "MULTHAQA", "ആഴ്ചക്കൂട്ടം"];

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

  const fileInputRef = useRef(null);

  useEffect(() => {
    saveData('chatGroups', groups);
  }, [groups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedGroup?.messages]);

  const handleSendMessage = (type = 'text', content = newMessage) => {
    if (!selectedGroup || (!content.trim() && type === 'text')) return;

    const message = {
      id: Date.now().toString(),
      sender: user.name,
      type,
      text: type === 'text' ? content.trim() : '',
      content: type !== 'text' ? content : '',
      timestamp: new Date().toISOString(),
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
      description: `Message sent`,
      className: "bg-blue-500 text-white"
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      handleSendMessage('image', fileUrl);
    } else if (fileType.startsWith('video/')) {
      handleSendMessage('video', fileUrl);
    } else if (fileType.startsWith('audio/')) {
      handleSendMessage('voice', fileUrl);
    } else {
      handleSendMessage('file', fileUrl);
    }

    e.target.value = null;
  };

  const handleDeleteMessage = (messageId) => {
    if (!selectedGroup) return;

    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? {
              ...group,
              messages: group.messages.filter(msg => msg.id !== messageId)
            }
          : group
      )
    );

    toast({
      title: "Message deleted",
      className: "bg-red-500 text-white"
    });
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
                  <div className="relative p-2 rounded-md shadow bg-purple-600 text-white max-w-lg">
                    <p className="text-xs mb-1 font-bold">{msg.sender}</p>

                    {msg.type === 'text' && <p>{msg.text}</p>}
                    {msg.type === 'image' && (
                      <img src={msg.content} alt="sent" className="max-w-full rounded" />
                    )}
                    {msg.type === 'video' && (
                      <video controls src={msg.content} className="max-w-full rounded" />
                    )}
                    {msg.type === 'voice' && (
                      <audio controls src={msg.content} className="w-full"></audio>
                    )}
                    {msg.type === 'file' && (
                      <a href={msg.content} download className="underline">Download File</a>
                    )}

                    <div className="flex justify-between items-center text-[10px] mt-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.sender === user.name && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-2 p-1 text-white"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef}></div>
            </ScrollArea>

            <div className="flex items-center gap-2 border-t pt-2">
              <Button onClick={() => fileInputRef.current.click()}>
                <Paperclip />
              </Button>

              <Input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

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
