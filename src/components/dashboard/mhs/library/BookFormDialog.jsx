import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

const BookFormDialog = ({
  open,
  onOpenChange,
  bookData,
  setBookData,
  onSave,
  editingBook,
  categories,
  libraryType
}) => {
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setBookData((prev) => ({ ...prev, category: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookData((prev) => ({
          ...prev,
          coverImage: file, // store the File object
          coverImagePreview: reader.result // store base64 for preview
        }));
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Cover Image Selected',
        description: file.name,
        className: 'bg-blue-500 text-white'
      });
    }
  };

  const handleInternalSave = () => {
    if (!bookData.name || !bookData.bookNumber || !bookData.category) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Book Name, Number, and Category are required.'
      });
      return;
    }
    onSave(bookData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>
            {editingBook ? 'Edit Book' : `Add New Book to ${libraryType}`}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-3">
          <div className="grid gap-3 py-2">
            <Label htmlFor="bookNameForm">Name</Label>
            <Input
              id="bookNameForm"
              name="name"
              value={bookData.name}
              onChange={handleInputChange}
            />

            <Label htmlFor="authorForm">Author</Label>
            <Input
              id="authorForm"
              name="author"
              value={bookData.author}
              onChange={handleInputChange}
            />

            <Label htmlFor="bookNumberForm">Book Number</Label>
            <Input
              id="bookNumberForm"
              name="bookNumber"
              value={bookData.bookNumber}
              onChange={handleInputChange}
            />

            <Label htmlFor="categoryForm">Category</Label>
            <Select
              name="category"
              value={bookData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="categoryForm">
                <SelectValue placeholder="Select Category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label htmlFor="publicationsForm">Publications</Label>
            <Input
              id="publicationsForm"
              name="publications"
              value={bookData.publications}
              onChange={handleInputChange}
            />

            <Label htmlFor="volumeForm">Volume</Label>
            <Input
              id="volumeForm"
              name="volume"
              value={bookData.volume}
              onChange={handleInputChange}
            />

            <Label htmlFor="priceForm">Price (₹)</Label>
            <Input
              id="priceForm"
              name="price"
              type="number"
              value={bookData.price}
              onChange={handleInputChange}
            />

            <Label htmlFor="coverImageFileForm">Cover Image</Label>
            <Input
              id="coverImageFileForm"
              name="coverImageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />

            {bookData.coverImagePreview && (
              <img
                src={bookData.coverImagePreview}
                alt="Cover preview"
                className="h-16 w-auto mt-1 border rounded"
              />
            )}

            {!bookData.coverImagePreview && bookData.coverImage && (
              <p className="text-xs text-muted-foreground">
                Current image: {bookData.coverImage.name || bookData.coverImage}
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInternalSave}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
          >
            {editingBook ? 'Save Changes' : 'Add Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookFormDialog;
