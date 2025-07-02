
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { loadData, saveData } from '@/lib/dataStore';
import { libraryCategories, kuthbkhanaCategories, initialBookData } from '@/lib/students';
import { Search, Bell, BookOpen, Info, Send, Heart, ThumbsUp, Meh, Smile } from 'lucide-react';

const StudentLibraryTab = ({ user, libraryType, messages }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const booksStorageKey = `libraryBooks_${libraryType}`;
  const books = loadData(booksStorageKey, libraryType === 'kuthbkhana' ? initialBookData.filter(b => b.isArabic) : initialBookData);
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetailsDialog, setShowBookDetailsDialog] = useState(false);
  
  const bookUserReviewsKey = `bookUserReviews_${libraryType}`; // Store reviews per library type
  const [allBookReviews, setAllBookReviews] = useState(loadData(bookUserReviewsKey, {})); // { bookId: { userId: {text, reactions}, userId2: ... } }
  const [currentUserReviewText, setCurrentUserReviewText] = useState('');
  const [newCommentText, setNewCommentText] = useState(''); // For commenting on other's reviews

  useEffect(() => {
    saveData(bookUserReviewsKey, allBookReviews);
  }, [allBookReviews, bookUserReviewsKey]);

  const filterBooks = (bookList, term) => {
    return bookList.filter(book => 
      (book.name.toLowerCase().includes(term.toLowerCase()) || 
       book.category.toLowerCase().includes(term.toLowerCase()) ||
       (book.author && book.author.toLowerCase().includes(term.toLowerCase())))
    );
  };

  const booksToDisplay = filterBooks(books, searchTerm);
  const relevantMessages = messages.filter(msg => msg.type === libraryType || (!msg.type && libraryType === 'library'));
  const categories = libraryType === 'library' ? libraryCategories : kuthbkhanaCategories;

  const handleBookClick = (book) => {
    setSelectedBook(book);
    const bookReviews = allBookReviews[book.id] || {};
    setCurrentUserReviewText(bookReviews[user.name]?.text || '');
    setShowBookDetailsDialog(true);
  };

  const handleSaveReview = () => {
    if (!selectedBook) return;
    setAllBookReviews(prevAllReviews => {
      const bookReviews = { ...(prevAllReviews[selectedBook.id] || {}) };
      bookReviews[user.name] = { 
        ...(bookReviews[user.name] || {}), 
        text: currentUserReviewText.trim(),
        timestamp: new Date().toISOString()
      };
      return { ...prevAllReviews, [selectedBook.id]: bookReviews };
    });
    toast({title: "Review Saved", description: `Your thoughts on "${selectedBook.name}" have been saved.`, className: "bg-green-500 text-white"});
  };

  const handleReactionToReview = (bookId, reviewAuthorName, reactionEmoji) => {
    setAllBookReviews(prevAllReviews => {
        const bookReviews = { ...(prevAllReviews[bookId] || {}) };
        if (!bookReviews[reviewAuthorName]) return prevAllReviews; // Should not happen

        const review = { ...bookReviews[reviewAuthorName] };
        review.reactions = review.reactions || {};
        
        if (review.reactions[reactionEmoji]?.includes(user.name)) {
            // User is removing their reaction
            review.reactions[reactionEmoji] = review.reactions[reactionEmoji].filter(name => name !== user.name);
            if (review.reactions[reactionEmoji].length === 0) delete review.reactions[reactionEmoji];
        } else {
            // User is adding a reaction (remove from other reactions first if any)
            Object.keys(review.reactions).forEach(emoji => {
                review.reactions[emoji] = review.reactions[emoji].filter(name => name !== user.name);
                if (review.reactions[emoji].length === 0) delete review.reactions[emoji];
            });
            review.reactions[reactionEmoji] = [...(review.reactions[reactionEmoji] || []), user.name];
        }
        
        bookReviews[reviewAuthorName] = review;
        return { ...prevAllReviews, [bookId]: bookReviews };
    });
  };
  
  const handleAddCommentToReview = (bookId, reviewAuthorName, commentText) => {
    if (!commentText.trim()) return;
    setAllBookReviews(prevAllReviews => {
        const bookReviews = { ...(prevAllReviews[bookId] || {}) };
        if (!bookReviews[reviewAuthorName]) return prevAllReviews;

        const review = { ...bookReviews[reviewAuthorName] };
        review.comments = review.comments || [];
        review.comments.push({
            author: user.name,
            text: commentText.trim(),
            timestamp: new Date().toISOString()
        });
        
        bookReviews[reviewAuthorName] = review;
        return { ...prevAllReviews, [bookId]: bookReviews };
    });
    setNewCommentText(''); // Clear comment input
    toast({title: "Comment Added", description: "Your comment has been posted.", className: "bg-blue-500 text-white"});
  };
  
  const handleOrderBook = (book) => {
    const mhsNotificationsKey = `mhsLibNotifications_${libraryType}`;
    const mhsNotifications = loadData(mhsNotificationsKey, []);
    mhsNotifications.push({ 
        date: new Date().toISOString(), 
        text: `${user.name} has requested to borrow the book: "${book.name}" (BN: ${book.bookNumber}). Please process.`,
        bookId: book.id,
        requester: user.name,
        status: 'pending'
    });
    saveData(mhsNotificationsKey, mhsNotifications);
    toast({title: "Order Request Sent", description: `Your request to borrow "${book.name}" has been sent to the ${libraryType} admin.`, className:"bg-blue-500 text-white"});
  };

  const reactionIcons = { heart: Heart, like: ThumbsUp, sad: Meh, smile: Smile };

  return (
    <>
      <Card className="bg-card/80 dark:bg-card/70 shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg text-primary/90">{libraryType === 'kuthbkhana' ? 'Kuthbkhana (Islamic Arabic Books)' : 'Library (All Books)'}</CardTitle>
          <div className="mt-2 relative">
            <Input 
              type="text"
              placeholder="Search by name, category, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden flex flex-col">
          {relevantMessages.length > 0 && (
            <div className="mb-3 p-2 bg-yellow-400/20 border border-yellow-500/30 rounded-md">
              <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 flex items-center"><Bell className="h-3.5 w-3.5 mr-1.5"/>Notifications</h4>
              <ScrollArea className="h-[50px] mt-1">
                <ul className="space-y-1 text-xs text-yellow-600 dark:text-yellow-200">
                  {relevantMessages.slice().reverse().map((msg, i) => (
                    <li key={i}><strong>{new Date(msg.date).toLocaleDateString([], {day:'2-digit', month:'short'})}:</strong> {msg.text}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
          <ScrollArea className="flex-grow">
            {booksToDisplay.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-2">
                {booksToDisplay.map(book => {
                  const isOverdue = book.isBorrowed && book.borrower === user.name && book.dueDate && new Date(book.dueDate) < new Date();
                  return (
                    <Card 
                        key={book.id} 
                        className={`flex flex-col bg-background/40 hover:shadow-lg transition-shadow cursor-pointer ${isOverdue ? 'border-2 border-red-500/70' : ''}`}
                        onClick={() => handleBookClick(book)}
                    >
                        <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-t-md overflow-hidden relative">
                            {book.coverImagePreview ? <img-replace src={book.coverImagePreview} alt={book.name} className="w-full h-full object-cover"/> : (book.coverImage && typeof book.coverImage === 'string' && book.coverImage.startsWith('data:image') ? <img-replace src={book.coverImage} alt={book.name} className="w-full h-full object-cover"/> : <BookOpen className="h-12 w-12 text-muted-foreground/50"/>)}
                           {isOverdue && <div className="absolute top-1 right-1 bg-red-600 text-white text-[0.6rem] px-1.5 py-0.5 rounded-sm font-semibold">OVERDUE</div>}
                        </div>
                        <CardHeader className="p-2 flex-grow">
                            <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">{book.name} {book.volume && `(Vol. ${book.volume})`}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground line-clamp-1">{book.author || 'N/A'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 text-xs">
                            <p className={`font-semibold ${book.isBorrowed ? (isOverdue ? 'text-red-600' : 'text-orange-500') : 'text-green-600'}`}>
                                {book.isBorrowed ? 
                                    (book.borrower === user.name ? `Borrowed by You (Due: ${new Date(book.dueDate).toLocaleDateString()})` : `Unavailable`) 
                                    : 'Available'}
                            </p>
                        </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-center text-muted-foreground py-8">No books match your search or available in this section.</p>}
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedBook && (
        <Dialog open={showBookDetailsDialog} onOpenChange={setShowBookDetailsDialog}>
          <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">{selectedBook.name} {selectedBook.volume && `(Vol. ${selectedBook.volume})`}</DialogTitle>
              <CardDescription>{selectedBook.author || 'Unknown Author'}</CardDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-2 -mr-3"> 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                    <div className="md:col-span-1">
                        {selectedBook.coverImagePreview ? <img-replace src={selectedBook.coverImagePreview} alt={selectedBook.name} className="w-full aspect-[3/4] object-cover rounded-md border shadow-md"/> : (selectedBook.coverImage && typeof selectedBook.coverImage === 'string' && selectedBook.coverImage.startsWith('data:image') ? <img-replace src={selectedBook.coverImage} alt={selectedBook.name} className="w-full aspect-[3/4] object-cover rounded-md border shadow-md"/> : <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center rounded-md border"><BookOpen className="h-16 w-16 text-muted-foreground/30"/></div>)}
                    </div>
                    <div className="md:col-span-2 space-y-1.5 text-sm">
                        <p><strong>Book Number:</strong> {selectedBook.bookNumber}</p>
                        <p><strong>Category:</strong> {categories.find(c=>c.value === selectedBook.category)?.label || selectedBook.category}</p>
                        <p><strong>Publications:</strong> {selectedBook.publications || 'N/A'}</p>
                        <p><strong>Price:</strong> ₹{selectedBook.price || 'N/A'}</p>
                        <p className={`font-semibold ${selectedBook.isBorrowed ? 'text-orange-500' : 'text-green-600'}`}>
                          Status: {selectedBook.isBorrowed ? 
                            (selectedBook.borrower === user.name ? `Borrowed by You (Due: ${new Date(selectedBook.dueDate).toLocaleDateString()})` : `Unavailable - Borrowed by ${selectedBook.borrower}`) 
                            : 'Available'}
                        </p>
                         {!selectedBook.isBorrowed && (
                            <Button size="sm" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleOrderBook(selectedBook)}>
                                <Send className="mr-2 h-4 w-4"/> Request to Borrow
                            </Button>
                        )}
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                    <Label htmlFor="aboutBookText" className="text-md font-semibold text-primary/90 flex items-center"><Info className="mr-2 h-4 w-4"/>About this Book (Your Notes)</Label>
                    <Textarea 
                        id="aboutBookText"
                        value={currentUserReviewText}
                        onChange={(e) => setCurrentUserReviewText(e.target.value)}
                        placeholder="Write your thoughts, summaries, or reviews about this book..."
                        rows={3}
                        className="mt-1.5 text-sm"
                    />
                    <Button size="sm" onClick={handleSaveReview} className="mt-2 bg-green-600 hover:bg-green-700 text-white">Save My Notes</Button>
                </div>
                <div className="mt-4 pt-3 border-t">
                    <h4 className="text-md font-semibold text-primary/90 mb-2">Reader Reviews & Discussions</h4>
                    {(Object.entries(allBookReviews[selectedBook.id] || {})).length === 0 && <p className="text-xs text-muted-foreground">No reviews yet for this book.</p>}
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                        {Object.entries(allBookReviews[selectedBook.id] || {}).map(([reviewAuthor, reviewData]) => (
                            <div key={reviewAuthor} className="p-2 border rounded-md bg-background/30 text-xs">
                                <p><strong>{reviewAuthor === user.name ? "Your Review" : `${reviewAuthor}'s Review`}:</strong></p>
                                <p className="whitespace-pre-wrap my-1">{reviewData.text}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                    {Object.entries(reactionIcons).map(([reactionKey, Icon]) => {
                                        const hasReacted = reviewData.reactions?.[reactionKey]?.includes(user.name);
                                        return (
                                            <Button key={reactionKey} variant="ghost" size="xs" onClick={() => handleReactionToReview(selectedBook.id, reviewAuthor, reactionKey)} className={`h-6 px-1.5 ${hasReacted ? 'text-primary' : 'text-muted-foreground'}`}>
                                                <Icon className={`mr-1 h-3 w-3 ${hasReacted ? 'fill-primary' : ''}`}/> {reviewData.reactions?.[reactionKey]?.length || 0}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <div className="mt-1.5 space-y-1">
                                    {(reviewData.comments || []).map((comment, idx) => (
                                        <div key={idx} className="pl-2 border-l-2 border-primary/20 text-[0.65rem]">
                                            <strong>{comment.author}:</strong> {comment.text}
                                        </div>
                                    ))}
                                    {reviewAuthor !== user.name && ( // Don't comment on your own review in this simple setup
                                        <div className="flex items-center space-x-1 mt-1">
                                            <Input 
                                                type="text" 
                                                placeholder={`Comment on ${reviewAuthor}'s review...`} 
                                                value={newCommentText} 
                                                onChange={e => setNewCommentText(e.target.value)}
                                                className="h-6 text-[0.7rem] flex-grow"
                                            />
                                            <Button size="xs" variant="outline" className="h-6 px-1.5 text-[0.7rem]" onClick={() => handleAddCommentToReview(selectedBook.id, reviewAuthor, newCommentText)}>Post</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="mt-auto pt-3">
              <Button variant="outline" onClick={() => setShowBookDetailsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default StudentLibraryTab;
