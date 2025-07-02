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
import { saveData, loadData } from '@/lib/dataStore';
import { studentNames, masterNames, mhsUserNamesAndRoles } from '@/lib/students';
import {
  Heart, MessageCircle, Send, ImagePlus, Search, ThumbsUp, SmilePlus, Video,
  Meh, Trash2, UploadCloud
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const PostogramPage = ({ user }) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState(loadData('postogramPosts', []));
  const [newPostText, setNewPostText] = useState('');
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostMediaType, setNewPostMediaType] = useState(null);
  const [newPostMediaPreview, setNewPostMediaPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);
  const fileInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const [userProfilePhoto, setUserProfilePhoto] = useState(user.photo || null);

  const allUsers = [...studentNames, ...masterNames, ...mhsUserNamesAndRoles.map(u => u.name)];

  useEffect(() => {
    saveData('postogramPosts', posts);
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
    setNewPostMediaPreview(null);
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

  const handleProfilePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePhoto(reader.result);
        let userDetailsKey;
        let userDetails;
        if (user.type === 'student') userDetailsKey = 'studentDetails';
        else if (user.type === 'master') userDetailsKey = 'masterDetails';
        else if (user.type === 'mhs') userDetailsKey = 'mhsUserDetails';

        if (userDetailsKey) {
          userDetails = loadData(userDetailsKey, {});
          if (userDetails[user.name]) {
            userDetails[user.name].photo = reader.result;
          } else {
            userDetails[user.name] = { photo: reader.result };
          }
          saveData(userDetailsKey, userDetails);
        }

        toast({ title: "Profile Updated", description: "Your profile photo is updated.", className: "bg-green-500 text-white" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReaction = (postId, reactionType) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const alreadyReacted = post.reactions[reactionType]?.includes(user.name);
        const newReactions = { ...post.reactions };
        Object.keys(newReactions).forEach(rt => {
          newReactions[rt] = newReactions[rt].filter(name => name !== user.name);
        });
        if (!alreadyReacted) {
          newReactions[reactionType] = [...newReactions[reactionType], user.name];
        }
        return { ...post, reactions: newReactions };
      }
      return post;
    }));
  };

  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, { author: user.name, text: commentText.trim(), timestamp: new Date().toISOString() }]
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    toast({ title: "Post Deleted", className: "bg-red-500 text-white" });
  };

  const displayedPosts = viewingProfile ? posts.filter(p => p.author === viewingProfile) : posts;
  const filteredUsers = allUsers.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ScrollArea className="h-full p-3">
      <div className="max-w-2xl mx-auto space-y-5">
        <Card className="p-4">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Postogram</CardTitle>
              <div className="flex flex-col items-center">
                <Avatar>
                  <AvatarImage src={userProfilePhoto || '/placeholder-avatar.png'} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button size="sm" variant="link" onClick={() => profilePhotoInputRef.current.click()}>Change</Button>
                <Input type="file" ref={profilePhotoInputRef} accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Share something..." />
            {newPostMedia && newPostMediaType === 'image' && <img src={newPostMedia} alt="Preview" className="mt-2 rounded-md max-h-60" />}
            {newPostMedia && newPostMediaType === 'video' && <video src={newPostMedia} controls className="mt-2 rounded-md max-h-60" />}
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={() => fileInputRef.current.click()}><ImagePlus className="mr-2" />Add Media</Button>
              <Input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
              <Button onClick={handlePostSubmit}><Send className="mr-2" />Post</Button>
            </div>
          </CardContent>
        </Card>

        {displayedPosts.map(post => (
          <Card key={post.id} className="p-4">
            <CardHeader className="flex justify-between">
              <div>
                <CardTitle>{post.author}</CardTitle>
                <CardDescription>{new Date(post.timestamp).toLocaleString()}</CardDescription>
              </div>
              {post.author === user.name && (
                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                  <Trash2 className="text-red-500" />
                </Button>
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
      </div>
    </ScrollArea>
  );
};

export default PostogramPage;
