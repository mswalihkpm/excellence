
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { studentNames, masterNames, mhsUserNamesAndRoles } from '@/lib/students'; 
import { Heart, MessageCircle, Send, ImagePlus, Search, ThumbsUp, SmilePlus, Video, Meh, Trash2, UploadCloud } from 'lucide-react';
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

  const [userProfilePhoto, setUserProfilePhoto] = useState(user.photo || null); // For Postogram specific profile photo

  const allUsers = [...studentNames, ...masterNames, ...mhsUserNamesAndRoles.map(u => u.name)];

  useEffect(() => {
    saveData('postogramPosts', posts);
  }, [posts]);

  const handlePostSubmit = () => {
    if (!newPostText.trim() && !newPostMedia) {
      toast({ variant: "destructive", title: "Empty Post", description: "Please add text or media to post." });
      return;
    }
    const newPost = {
      id: Date.now().toString(),
      author: user.name,
      authorType: user.type,
      authorPhoto: userProfilePhoto, // Use Postogram specific photo
      text: newPostText.trim(),
      media: newPostMedia, 
      mediaType: newPostMediaType,
      mediaPreview: newPostMediaPreview, // Store preview for display
      timestamp: new Date().toISOString(),
      reactions: { like: [], heart: [], sad: [] }, 
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    setNewPostMedia(null);
    setNewPostMediaType(null);
    setNewPostMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    toast({ title: "Posted!", description: "Your post is live on Postogram.", className: "bg-gradient-to-r from-green-500 to-teal-500 text-white" });
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostMedia(file.name); // Simulate: store file name
        setNewPostMediaPreview(reader.result); // Store base64 for preview
        if (file.type.startsWith('image/')) setNewPostMediaType('image');
        else if (file.type.startsWith('video/')) setNewPostMediaType('video');
        else setNewPostMediaType('file');
      };
      reader.readAsDataURL(file);
      toast({ title: "Media Selected", description: `${file.name} ready. (Upload simulated)`, className: "bg-blue-500 text-white" });
    }
  };

  const handleProfilePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfilePhoto(reader.result);
        // Update the main user photo in localStorage as well
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
        // Update user object in App.jsx (this is tricky without direct state update function from App)
        // For now, local state and localStorage update will reflect in Postogram
        toast({ title: "Profile Photo Updated", description: "Your Postogram profile photo has been updated.", className: "bg-green-500 text-white" });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleReaction = (postId, reactionType) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const currentReactions = post.reactions[reactionType] || [];
        const alreadyReacted = currentReactions.includes(user.name);
        
        const newReactions = { ...post.reactions };
        Object.keys(newReactions).forEach(rt => {
            newReactions[rt] = newReactions[rt].filter(name => name !== user.name);
        });

        if (!alreadyReacted) {
          newReactions[reactionType] = [...(newReactions[reactionType] || []), user.name];
        }
        
        return { ...post, reactions: newReactions };
      }
      return post;
    }));
  };
  
  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    setPosts(prevPosts => prevPosts.map(post => {
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
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    toast({ title: "Post Deleted", description: "Your post has been removed.", className: "bg-orange-500 text-white" });
  };

  const displayedPosts = viewingProfile 
    ? posts.filter(post => post.author === viewingProfile)
    : posts;

  const filteredUsersForSearch = allUsers.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ScrollArea className="h-full p-1 bg-gradient-to-br from-indigo-100/30 via-purple-100/30 to-pink-100/30 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-lg">
      <div className="max-w-2xl mx-auto space-y-5 py-4">
        <Card className="shadow-xl bg-card/85 dark:bg-card/75 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">Postogram</CardTitle>
                    {viewingProfile && (
                    <div className="flex items-center justify-between mt-1">
                        <CardDescription>Viewing posts by: <span className="font-semibold text-foreground">{viewingProfile}</span></CardDescription>
                        <Button variant="outline" size="sm" onClick={() => setViewingProfile(null)}>Back to Feed</Button>
                    </div>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <Avatar className="h-12 w-12 border-2 border-primary/40 shadow-sm">
                        <AvatarImage src={userProfilePhoto || (user.photo) || '/placeholder-avatar.png'} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button variant="link" size="xs" className="text-xs p-0 h-auto mt-1 text-primary/80" onClick={() => profilePhotoInputRef.current?.click()}>
                        <UploadCloud className="h-3 w-3 mr-1"/>Change Photo
                    </Button>
                    <Input id="profilePhotoUpload" type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" ref={profilePhotoInputRef}/>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!viewingProfile && (
              <div className="p-3 border rounded-lg bg-background/60 space-y-2 shadow-inner">
                <Textarea
                  placeholder="Share something inspiring..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  rows={3}
                  className="text-sm bg-background/70 focus:bg-background"
                />
                {newPostMediaPreview && (
                    <div className="my-2">
                        {newPostMediaType === 'image' && <img-replace src={newPostMediaPreview} alt="Preview" className="max-h-40 rounded-md border"/>}
                        {newPostMediaType === 'video' && <div className="p-2 border rounded-md bg-slate-200 dark:bg-slate-700 text-sm text-muted-foreground">Video Preview: {newPostMedia}</div>}
                    </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                     <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-primary">
                        <ImagePlus className="h-5 w-5"/>
                     </Button>
                     <Input id="postMediaUpload" type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" ref={fileInputRef}/>
                     {newPostMedia && !newPostMediaPreview && <span className="text-xs text-muted-foreground">Selected: {newPostMedia.length > 20 ? newPostMedia.substring(0,17)+'...' : newPostMedia}</span>}
                  </div>
                  <Button onClick={handlePostSubmit} size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all duration-300 transform hover:scale-105"><Send className="mr-2 h-4 w-4"/>Post</Button>
                </div>
              </div>
            )}

            <div className="p-3 border rounded-lg bg-background/60 shadow-inner">
              <Label htmlFor="searchUserPostogram" className="text-sm font-medium text-muted-foreground">Find Friends & Colleagues</Label>
              <div className="flex items-center mt-1 space-x-2">
                <Search className="h-4 w-4 text-muted-foreground ml-1" />
                <Input 
                  id="searchUserPostogram"
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm h-9 bg-background/70 focus:bg-background flex-grow"
                />
              </div>
              {searchTerm && (
                <ScrollArea className="mt-2 max-h-[150px] border rounded-md p-2 bg-background/30">
                  {filteredUsersForSearch.length > 0 ? filteredUsersForSearch.map(name => (
                    <Button key={name} variant="ghost" className="w-full justify-start text-sm h-8 hover:bg-primary/10" onClick={() => {setViewingProfile(name); setSearchTerm('');}}>
                      {name}
                    </Button>
                  )) : <p className="text-xs text-muted-foreground text-center py-1">No users found.</p>}
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>

        {displayedPosts.length === 0 && (
          <Card className="shadow-lg bg-card/80 dark:bg-card/70 backdrop-blur-sm">
            <CardContent className="py-10 text-center">
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
                <ImagePlus className="h-16 w-16 text-primary/30 mx-auto mb-3"/>
                <p className="text-muted-foreground">
                  {viewingProfile ? `${viewingProfile} hasn't posted anything yet.` : "No posts on Postogram yet. Be the first!"}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        )}

        {displayedPosts.map(post => (
          <motion.div key={post.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
            <Card className="shadow-lg bg-card/85 dark:bg-card/75 backdrop-blur-md overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/30">
                            <AvatarImage src={post.authorPhoto || (post.authorType === 'master' ? '/master-avatar.png' : `/student-avatar.png`)} /> 
                            <AvatarFallback>{post.author.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-md font-semibold cursor-pointer hover:underline text-foreground" onClick={() => setViewingProfile(post.author)}>{post.author}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">{new Date(post.timestamp).toLocaleString()}</CardDescription>
                        </div>
                    </div>
                    {post.author === user.name && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-600 h-7 w-7">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
              </CardHeader>
              <CardContent className="pt-1 pb-2">
                {post.text && <p className="text-sm mb-3 whitespace-pre-wrap text-foreground/90">{post.text}</p>}
                {post.media && (
                  <div className="rounded-lg overflow-hidden border border-border/50 my-2 aspect-video bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    {post.mediaType === 'image' && post.mediaPreview && <img-replace src={post.mediaPreview} alt="Post media" className="w-full h-full object-contain"/>}
                    {post.mediaType === 'image' && !post.mediaPreview && <ImagePlus className="h-20 w-20 text-muted-foreground/50"/>}
                    {post.mediaType === 'video' && post.mediaPreview && <div className="p-2 text-sm text-muted-foreground">Video: {post.media} (Preview not supported)</div>}
                    {post.mediaType === 'video' && !post.mediaPreview && <Video className="h-20 w-20 text-muted-foreground/50"/>}
                    {!post.mediaPreview && <p className="text-sm text-muted-foreground ml-2">(Simulated Media: {post.media})</p>}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-2.5 border-t border-border/50 pt-2.5 bg-background/30">
                <div className="flex space-x-1 items-center">
                  {[ {type: 'like', icon: ThumbsUp, color: 'text-blue-500', fillColor: 'fill-blue-500'}, 
                     {type: 'heart', icon: Heart, color: 'text-red-500', fillColor: 'fill-red-500'},
                     {type: 'sad', icon: Meh, color: 'text-yellow-500', fillColor: 'fill-yellow-500'}].map(reaction => {
                       const Icon = reaction.icon;
                       const hasReacted = post.reactions[reaction.type]?.includes(user.name);
                       return (
                        <Button key={reaction.type} variant="ghost" size="sm" onClick={() => handleReaction(post.id, reaction.type)} className={`h-7 px-2 text-xs ${hasReacted ? reaction.color : 'text-muted-foreground hover:text-foreground/70'}`}>
                          <Icon className={`mr-1 h-4 w-4 ${hasReacted ? reaction.fillColor : ''}`}/> {post.reactions[reaction.type]?.length || 0}
                        </Button>
                       );
                  })}
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground/70">
                    <MessageCircle className="mr-1 h-4 w-4"/> {post.comments.length}
                  </Button>
                </div>
                <div className="w-full space-y-1.5 pt-1">
                  {post.comments.slice(0,2).map((comment, idx) => ( 
                    <div key={idx} className="text-xs bg-background/50 p-1.5 rounded-md shadow-sm">
                      <strong className="cursor-pointer hover:underline text-foreground/80" onClick={() => setViewingProfile(comment.author)}>{comment.author}:</strong> <span className="text-foreground/70">{comment.text}</span>
                    </div>
                  ))}
                  {post.comments.length > 2 && <p className="text-xs text-primary/70 cursor-pointer hover:underline pl-1">View all {post.comments.length} comments...</p>}
                  <CommentForm postId={post.id} onAddComment={handleAddComment} />
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

const CommentForm = ({ postId, onAddComment }) => {
  const [commentText, setCommentText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(postId, commentText);
    setCommentText('');
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-1.5 pt-1">
      <Input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a thoughtful comment..." className="h-8 text-xs flex-grow bg-background/70 focus:bg-background"/>
      <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-xs hover:bg-primary/10 text-primary/80">Comment</Button>
    </form>
  );
};

export default PostogramPage;
