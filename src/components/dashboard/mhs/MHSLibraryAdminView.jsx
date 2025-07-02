import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { initialBookData, libraryCategories, kuthbkhanaCategories } from '@/lib/students';
import { saveData, loadData } from '@/lib/dataStore';
import { Package, Users, Search } from 'lucide-react';

import BookFormDialog from '@/components/dashboard/mhs/library/BookFormDialog';
import BorrowManagementDialog from '@/components/dashboard/mhs/library/BorrowManagementDialog';
import BookListItem from '@/components/dashboard/mhs/library/BookListItem';


const MHSLibraryAdminView = ({ user, libraryType }) => {
  const { toast } = useToast();
  const booksStorageKey = `libraryBooks_${libraryType}`;
  const initialBooks = libraryType === 'kuthbkhana' ? initialBookData.filter(b => b.isArabic) : initialBookData;
  const [books, setBooks] = useState(loadData(booksStorageKey, initialBooks));
  
  const [showAddBookDialog, setShowAddBookDialog] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBookData, setNewBookData] = useState({ name: '', author: '', bookNumber: '', category: '', publications: '', price: '', coverImage: null, volume: '', isArabic: libraryType === 'kuthbkhana', coverImagePreview: null });

  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [bookToManageBorrow, setBookToManageBorrow] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState("manageBooks");

  const categories = libraryType === 'library' ? libraryCategories : kuthbkhanaCategories;

  useEffect(() => {
    saveData(booksStorageKey, books);
  }, [books, booksStorageKey]);


  const handleSaveBook = (bookData) => {
    if (editingBook) {
      setBooks(books.map(b => b.id === editingBook.id ? { ...editingBook, ...bookData } : b));
      toast({ title: "Book Updated", description: `${bookData.name} updated successfully.`, className: "bg-green-500 text-white" });
    } else {
      setBooks(prev => [...prev, { ...bookData, id: Date.now().toString(), isBorrowed: false, borrower: null, borrowedDate: null, borrowerPlace: null, dueDate: null }]);
      toast({ title: "Book Added", description: `${bookData.name} added to ${libraryType}.`, className: "bg-green-500 text-white" });
    }
    setShowAddBookDialog(false);
    setEditingBook(null);
    setNewBookData({ name: '', author: '', bookNumber: '', category: '', publications: '', price: '', coverImage: null, volume: '', isArabic: libraryType === 'kuthbkhana', coverImagePreview: null });
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setNewBookData({ ...book, coverImagePreview: book.coverImagePreview || (book.coverImage && typeof book.coverImage === 'string' && book.coverImage.startsWith('data:image') ? book.coverImage : null) });
    setShowAddBookDialog(true);
  };

  const handleDeleteBook = (bookId) => {
    setBooks(books.filter(b => b.id !== bookId));
    toast({ title: "Book Deleted", description: `Book removed from ${libraryType}.`, className: "bg-red-500 text-white" });
  };

  const openBorrowManagementDialog = (book) => {
    setBookToManageBorrow(book);
    setShowBorrowDialog(true);
  };

  const handleConfirmBorrowReturn = (updatedBookDetails) => {
    setBooks(books.map(b => b.id === updatedBookDetails.id ? updatedBookDetails : b));
    
    const action = updatedBookDetails.isBorrowed ? 'borrowed' : 'returned';
    const byWhom = action === 'borrowed' ? `by ${updatedBookDetails.borrower}` : (bookToManageBorrow?.borrower ? `by ${bookToManageBorrow.borrower}` : '');
    
    toast({ 
        title: `Book ${action.charAt(0).toUpperCase() + action.slice(1)}`, 
        description: `${updatedBookDetails.name} ${action} ${byWhom}.`, 
        className: action === 'borrowed' ? "bg-blue-500 text-white" : "bg-green-500 text-white" 
    });

    const mhsNotificationsKey = `mhsLibNotifications_${libraryType}`;
    const mhsNotifications = loadData(mhsNotificationsKey, []);
    mhsNotifications.push({ date: new Date().toISOString(), text: `Book "${updatedBookDetails.name}" was ${action} ${byWhom}.`});
    saveData(mhsNotificationsKey, mhsNotifications);

    setShowBorrowDialog(false);
    setBookToManageBorrow(null);
  };

  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.bookNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const borrowedBooksList = books.filter(book => book.isBorrowed);

  return (
    <ScrollArea className="h-full p-1">
      <Card className="bg-card/80 dark:bg-card/70 shadow-lg min-h-full">
        <CardHeader>
          <CardTitle className="text-xl text-primary/90">{libraryType.charAt(0).toUpperCase() + libraryType.slice(1)} Management</CardTitle>
          <CardDescription>Add, edit, and manage books and borrowing details in the {libraryType}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 bg-primary/10">
              <TabsTrigger value="manageBooks" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Package className="mr-2 h-4 w-4"/>Manage Books</TabsTrigger>
              <TabsTrigger value="borrowerDetails" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="mr-2 h-4 w-4"/>Borrower Details</TabsTrigger>
            </TabsList>
            <TabsContent value="manageBooks">
              <div className="flex justify-between items-center mb-2">
                <div className="relative flex-grow mr-2">
                  <Input 
                    type="text"
                    placeholder="Search books by name, author, category, number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm h-9"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button size="sm" onClick={() => { setEditingBook(null); setNewBookData({ name: '', author: '', bookNumber: '', category: '', publications: '', price: '', coverImage: null, volume: '', isArabic: libraryType === 'kuthbkhana', coverImagePreview: null }); setShowAddBookDialog(true);}} className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  Add Book
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-30rem)] sm:h-[calc(100vh-28rem)]">
                {filteredBooks.length === 0 && <p className="text-center text-muted-foreground py-8">No books found or added yet for {libraryType}.</p>}
                <ul className="space-y-2 pr-2">
                  {filteredBooks.map(book => (
                    <BookListItem 
                      key={book.id} 
                      book={book} 
                      categories={categories}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                      onManageBorrow={openBorrowManagementDialog}
                    />
                  ))}
                </ul>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="borrowerDetails">
                <h3 className="text-md font-semibold mb-2 text-primary/80">Currently Borrowed Books ({borrowedBooksList.length})</h3>
                <ScrollArea className="h-[calc(100vh-28rem)] sm:h-[calc(100vh-26rem)] border rounded-md p-2 bg-background/30">
                    {borrowedBooksList.length === 0 && <p className="text-center text-muted-foreground py-6">No books are currently borrowed.</p>}
                    <ul className="space-y-2">
                        {borrowedBooksList.map(book => (
                            <li key={`borrowed-${book.id}`} className="p-2 bg-background/50 rounded-md">
                                <p className="font-medium text-sm">{book.name}</p>
                                <p className="text-xs text-muted-foreground">Borrowed by: <span className="font-semibold text-foreground">{book.borrower}</span> {book.borrowerPlace && `(${book.borrowerPlace})`}</p>
                                <p className="text-xs text-muted-foreground">Borrowed Date: {new Date(book.borrowedDate).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">Due Date: <span className="font-semibold text-orange-600">{new Date(book.dueDate).toLocaleDateString()}</span></p>
                                 <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" onClick={() => openBorrowManagementDialog(book)}>Manage this borrow</Button>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

     <BookFormDialog
        open={showAddBookDialog}
        onOpenChange={setShowAddBookDialog}
        bookData={newBookData}
        setBookData={setNewBookData}
        onSave={handleSaveBook}
        editingBook={editingBook}
        categories={categories}
        libraryType={libraryType}
     />

    <BorrowManagementDialog
        open={showBorrowDialog}
        onOpenChange={setShowBorrowDialog}
        bookToManage={bookToManageBorrow}
        onConfirm={handleConfirmBorrowReturn}
        libraryType={libraryType}
    />

    </ScrollArea>
  );
};

export default MHSLibraryAdminView;