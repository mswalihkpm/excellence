import React, { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Heart, MessageCircle, Send, ImagePlus, Search, ThumbsUp, Video, Meh, Trash2, UploadCloud
} from 'lucide-react';
import { motion } from 'framer-motion';

const PostogramPage = ({ user }) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostMediaType, setNewPostMediaType] = useState(null);
  const fileInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const [userProfilePhoto, setUserProfilePhoto] = useState(user.photo || null);

  // Load all posts from localStorage for all users
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ALL_POSTOGRAM_POSTS')) || [];
    setPosts(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('ALL_POSTOGRAM_POSTS', JSON.stringify(posts));
  }, [posts]);

  const handlePostSubmit = () => {
    if (!newPostText.trim() && !newPostMedia) {
      toast({ variant: "destructive", title: "Empty Post", description: "Please add text or media." });
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      author: user.name,
      authorPhoto: userProfilePhoto,
      text: newPostText.trim(),
      media: newPostMedia,
      mediaType: newPostMediaType,
      timestamp: new Date().toISOString(),
      reactions: { like: [], heart: [], sad: [] },
      comments: [],
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    setNewPostMedia(null);
    setNewPostMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    toast({ title: "Posted!", description: "Your post is live!", className: "bg-green-500 text-white" });
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);

      setNewPostMedia(fileUrl);
      if (file.type.startsWith('image/')) {
        setNewPostMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setNewPostMediaType('video');
      } else {
        setNewPostMediaType('file');
      }

      toast({ title: "Media Selected", description: `${file.name} ready.`, className: "bg-blue-500 text-white" });
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast({ title: "Post Deleted", className: "bg-red-500 text-white" });
  };

  const handleReaction = (postId, type) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const already = post.reactions[type].includes(user.name);
        const updated = { ...post.reactions };
        Object.keys(updated).forEach(rt => {
          updated[rt] = updated[rt].filter(u => u !== user.name);
        });
        if (!already) updated[type].push(user.name);
        return { ...post, reactions: updated };
      }
      return post;
    }));
  };

  return (
    <ScrollArea className="h-full p-3">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Postogram</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Share something..." />
          {newPostMedia && newPostMediaType === 'image' && <img src={newPostMedia} alt="preview" className="mt-2 rounded-md max-h-60" />}
          {newPostMedia && newPostMediaType === 'video' && <video src={newPostMedia} controls className="mt-2 rounded-md max-h-60" />}
          <div className="flex justify-between mt-2">
            <Button onClick={() => fileInputRef.current.click()}><ImagePlus className="mr-2" />Media</Button>
            <Input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
            <Button onClick={handlePostSubmit}><Send className="mr-2" />Post</Button>
          </div>
        </CardContent>
      </Card>

      {posts.map(post => (
        <Card key={post.id} className="p-4 mt-4">
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>{post.author}</CardTitle>
              <CardDescription>{new Date(post.timestamp).toLocaleString()}</CardDescription>
            </div>
            {post.author === user.name && (
              <Button variant="ghost" onClick={() => handleDeletePost(post.id)}><Trash2 className="text-red-500" /></Button>
            )}
          </CardHeader>
          <CardContent>
            <p>{post.text}</p>
            {post.media && post.mediaType === 'image' && <img src={post.media} alt="media" className="mt-2 rounded-md max-h-80" />}
            {post.media && post.mediaType === 'video' && <video src={post.media} controls className="mt-2 rounded-md max-h-80" />}
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="ghost" onClick={() => handleReaction(post.id, 'like')}><ThumbsUp className="mr-1" />{post.reactions.like.length}</Button>
            <Button size="sm" variant="ghost" onClick={() => handleReaction(post.id, 'heart')}><Heart className="mr-1" />{post.reactions.heart.length}</Button>
            <Button size="sm" variant="ghost" onClick={() => handleReaction(post.id, 'sad')}><Meh className="mr-1" />{post.reactions.sad.length}</Button>
          </CardFooter>
        </Card>
      ))}
    </ScrollArea>
  );
};

export default PostogramPage;
