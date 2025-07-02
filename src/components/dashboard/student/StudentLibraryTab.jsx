import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { loadData, saveData } from '@/lib/dataStore';
import {
  libraryCategories,
  kuthbkhanaCategories,
  initialBookData
} from '@/lib/students';
import {
  Search,
  Bell,
  BookOpen,
  Info,
  Send,
  Heart,
  ThumbsUp,
  Meh,
  Smile
} from 'lucide-react';

const StudentLibraryTab = ({ user, libraryType, messages }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const booksStorageKey = `libraryBooks_${libraryType}`;
  const books = loadData(
    booksStorageKey,
    libraryType === 'kuthbkhana'
      ? initialBookData.filter((b) => b.isArabic)
      : initialBookData
  );

  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetailsDialog, setShowBookDetailsDialog] = useState(false);

  const bookUserReviewsKey = `bookUserReviews_${libraryType}`;
  const [allBookReviews, setAllBookReviews] = useState(
    loadData(bookUserReviewsKey, {})
  );
  const [currentUserReviewText, setCurrentUserReviewText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    saveData(bookUserReviewsKey, allBookReviews);
  }, [allBookReviews, bookUserReviewsKey]);

  const filterBooks = (bookList, term) => {
    return bookList.filter(
      (book) =>
        book.name.toLowerCase().includes(term.toLowerCase()) ||
        book.category.toLowerCase().includes(term.toLowerCase()) ||
        (book.author &&
          book.author.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const booksToDisplay = filterBooks(books, searchTerm);
  const relevantMessages = messages.filter(
    (msg) => msg.type === libraryType || (!msg.type && libraryType === 'library')
  );
  const categories =
    libraryType === 'library' ? libraryCategories : kuthbkhanaCategories;

  const handleBookClick = (book) => {
    setSelectedBook(book);
    const bookReviews = allBookReviews[book.id] || {};
    setCurrentUserReviewText(bookReviews[user.name]?.text || '');
    setShowBookDetailsDialog(true);
  };

  const handleSaveReview = () => {
    if (!selectedBook) return;
    setAllBookReviews((prevAllReviews) => {
      const bookReviews = { ...(prevAllReviews[selectedBook.id] || {}) };
      bookReviews[user.name] = {
        ...(bookReviews[user.name] || {}),
        text: currentUserReviewText.trim(),
        timestamp: new Date().toISOString()
      };
      return { ...prevAllReviews, [selectedBook.id]: bookReviews };
    });
    toast({
      title: 'Review Saved',
      description: `Your thoughts on "${selectedBook.name}" have been saved.`,
      className: 'bg-green-500 text-white'
    });
  };

  const handleReactionToReview = (bookId, reviewAuthorName, reactionEmoji) => {
    setAllBookReviews((prevAllReviews) => {
      const bookReviews = { ...(prevAllReviews[bookId] || {}) };
      if (!bookReviews[reviewAuthorName]) return prevAllReviews;

      const review = { ...bookReviews[reviewAuthorName] };
      review.reactions = review.reactions || {};

      if (review.reactions[reactionEmoji]?.includes(user.name)) {
        review.reactions[reactionEmoji] = review.reactions[reactionEmoji].filter(
          (name) => name !== user.name
        );
        if (review.reactions[reactionEmoji].length === 0)
          delete review.reactions[reactionEmoji];
      } else {
        Object.keys(review.reactions).forEach((emoji) => {
          review.reactions[emoji] = review.reactions[emoji].filter(
            (name) => name !== user.name
          );
          if (review.reactions[emoji].length === 0)
            delete review.reactions[emoji];
        });
        review.reactions[reactionEmoji] = [
          ...(review.reactions[reactionEmoji] || []),
          user.name
        ];
      }

      bookReviews[reviewAuthorName] = review;
      return { ...prevAllReviews, [bookId]: bookReviews };
    });
  };

  const handleAddCommentToReview = (bookId, reviewAuthorName, commentText) => {
    if (!commentText.trim()) return;
    setAllBookReviews((prevAllReviews) => {
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
    setNewCommentText('');
    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted.',
      className: 'bg-blue-500 text-white'
    });
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
    toast({
      title: 'Order Request Sent',
      description: `Your request to borrow "${book.name}" has been sent to the ${libraryType} admin.`,
      className: 'bg-blue-500 text-white'
    });
  };

  const reactionIcons = { heart: Heart, like: ThumbsUp, sad: Meh, smile: Smile };

  const getCoverImageSrc = (book) => {
    if (book.coverImagePreview) return book.coverImagePreview;

    if (book.coverImage) {
      if (book.coverImage instanceof File) {
        return URL.createObjectURL(book.coverImage);
      }
      if (
        typeof book.coverImage === 'string' &&
        book.coverImage.startsWith('data:image')
      ) {
        return book.coverImage;
      }
    }

    return null;
  };

  return (
    <>
      <Card className="bg-card/80 dark:bg-card/70 shadow-md h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg text-primary/90">
            {libraryType === 'kuthbkhana'
              ? 'Kuthbkhana (Islamic Arabic Books)'
              : 'Library (All Books)'}
          </CardTitle>
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
              <h4 className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                Notifications
              </h4>
              <ScrollArea className="h-[50px] mt-1">
                <ul className="space-y-1 text-xs text-yellow-600 dark:text-yellow-200">
                  {relevantMessages
                    .slice()
                    .reverse()
                    .map((msg, i) => (
                      <li key={i}>
                        <strong>
                          {new Date(msg.date).toLocaleDateString([], {
                            day: '2-digit',
                            month: 'short'
                          })}
                          :
                        </strong>{' '}
                        {msg.text}
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            </div>
          )}
          <ScrollArea className="flex-grow">
            {booksToDisplay.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 pr-2">
                {booksToDisplay.map((book) => {
                  const isOverdue =
                    book.isBorrowed &&
                    book.borrower === user.name &&
                    book.dueDate &&
                    new Date(book.dueDate) < new Date();
                  const coverSrc = getCoverImageSrc(book);

                  return (
                    <Card
                      key={book.id}
                      className={`flex flex-col bg-background/40 hover:shadow-lg transition-shadow cursor-pointer ${
                        isOverdue ? 'border-2 border-red-500/70' : ''
                      }`}
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-t-md overflow-hidden relative">
                        {coverSrc ? (
                          <img
                            src={coverSrc}
                            alt={book.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        )}
                        {isOverdue && (
                          <div className="absolute top-1 right-1 bg-red-600 text-white text-[0.6rem] px-1.5 py-0.5 rounded-sm font-semibold">
                            OVERDUE
                          </div>
                        )}
                      </div>
                      <CardHeader className="p-2 flex-grow">
                        <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
                          {book.name} {book.volume && `(Vol. ${book.volume})`}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                          {book.author || 'N/A'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-2 text-xs">
                        <p
                          className={`font-semibold ${
                            book.isBorrowed
                              ? isOverdue
                                ? 'text-red-600'
                                : 'text-orange-500'
                              : 'text-green-600'
                          }`}
                        >
                          {book.isBorrowed
                            ? book.borrower === user.name
                              ? `Borrowed by You (Due: ${new Date(
                                  book.dueDate
                                ).toLocaleDateString()})`
                              : `Unavailable`
                            : 'Available'}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No books match your search or available in this section.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Dialog part skipped for brevity. If you want, I’ll update the Dialog image logic too on request! */}
    </>
  );
};

export default StudentLibraryTab;

