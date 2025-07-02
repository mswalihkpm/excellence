import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeftRight, Edit3, Trash2 } from 'lucide-react';

const BookListItem = ({ book, categories, onEdit, onDelete, onManageBorrow }) => {
  return (
    <li className="p-3 bg-background/50 dark:bg-background/40 rounded-md shadow-sm border border-border/30">
      <div className="flex justify-between items-start">
         <div className="flex items-start space-x-3">
            {book.coverImagePreview ? 
                <img-replace src={book.coverImagePreview} alt={book.name} className="h-16 w-12 object-cover rounded-sm border border-border/50"/> : 
                (book.coverImage && typeof book.coverImage === 'string' && book.coverImage.startsWith('data:image') ?
                  <img-replace src={book.coverImage} alt={book.name} className="h-16 w-12 object-cover rounded-sm border border-border/50"/> :
                  <div className="h-16 w-12 bg-muted/50 dark:bg-muted/40 rounded-sm flex items-center justify-center"><BookOpen className="h-6 w-6 text-muted-foreground/70"/></div>
                )
            }
            <div>
                <h4 className="font-medium text-foreground">{book.name} {book.volume && `(Vol. ${book.volume})`}</h4>
                <p className="text-xs text-muted-foreground">By {book.author || 'N/A'} | BN: {book.bookNumber}</p>
                <p className="text-xs text-muted-foreground">Category: {categories.find(c=>c.value === book.category)?.label || book.category}</p>
                <p className={`text-xs font-semibold ${book.isBorrowed ? 'text-orange-500 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                    {book.isBorrowed ? `Borrowed by ${book.borrower}` : 'Available'}
                </p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onManageBorrow(book)} className={`h-7 px-2 text-xs ${book.isBorrowed ? 'border-orange-500 text-orange-500 hover:bg-orange-500/10' : 'border-green-500 text-green-600 hover:bg-green-500/10'}`}>
            <ArrowLeftRight className="mr-1 h-3 w-3" /> {book.isBorrowed ? 'Manage Return' : 'Manage Borrow'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(book)} className="text-blue-500 hover:text-blue-600 h-7 w-7"><Edit3 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(book.id)} className="text-red-500 hover:text-red-600 h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </li>
  );
};

export default BookListItem;