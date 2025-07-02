
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { saveData, loadData } from '@/lib/dataStore';
import { Label } from '@/components/ui/label';
import { ShoppingCart, PlusCircle, PackageOpen, Edit3, Trash2, Search, Image as ImageIconPlaceholder } from 'lucide-react';

const StorePage = ({ user }) => {
  const { toast } = useToast();
  const [items, setItems] = useState(loadData('storeItems', []));
  const [cart, setCart] = useState(loadData(`userCart_${user.name}`, []));

  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', image: null, imagePreview: null }); 
  
  const [searchTerm, setSearchTerm] = useState('');

  const canManageStore = user.type === 'master' || (user.type === 'mhs' && user.subRole === 'seller');

  useEffect(() => { saveData('storeItems', items); }, [items]);
  useEffect(() => { saveData(`userCart_${user.name}`, cart); }, [cart]);

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleItemImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(prev => ({ ...prev, image: file.name, imagePreview: reader.result })); // Store base64 for preview
      };
      reader.readAsDataURL(file);
      toast({ title: "Image Selected", description: `${file.name} ready. (Upload simulated)`, className: "bg-blue-500 text-white" });
    }
  };

  const handleSaveItem = () => {
    if (!newItem.name.trim() || !newItem.price.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Item name and price are required." });
      return;
    }
    const priceNum = parseFloat(newItem.price);
    if (isNaN(priceNum) || priceNum < 0) {
        toast({ variant: "destructive", title: "Error", description: "Price must be a valid non-negative number." });
        return;
    }

    const itemDataToSave = { 
      name: newItem.name, 
      price: priceNum, 
      description: newItem.description, 
      image: newItem.image, 
      imagePreview: newItem.imagePreview 
    };

    if (editingItem) {
      setItems(prevItems => prevItems.map(item => item.id === editingItem.id ? { ...item, ...itemDataToSave } : item));
      toast({ title: "Item Updated", description: `${newItem.name} updated successfully.`, className: "bg-green-500 text-white" });
    } else {
      setItems(prevItems => [...prevItems, { ...itemDataToSave, id: Date.now().toString(), addedBy: user.name }]);
      toast({ title: "Item Added", description: `${newItem.name} added to the store.`, className: "bg-green-500 text-white" });
    }
    setShowAddItemDialog(false);
    setNewItem({ name: '', price: '', description: '', image: null, imagePreview: null });
    setEditingItem(null);
     if (document.getElementById('itemImageUploadStore')) document.getElementById('itemImageUploadStore').value = null;
  };
  
  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({...item, price: item.price.toString(), imagePreview: item.imagePreview || null }); 
    setShowAddItemDialog(true);
  };
  
  const handleDeleteItem = (itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({ title: "Item Deleted", description: `Item removed from store.`, className: "bg-red-500 text-white" });
  };

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast({ title: "Added to Cart", description: `${item.name} added to your cart.`, className: "bg-blue-500 text-white" });
  };

  const handlePlaceOrder = () => {
     if (cart.length === 0) {
        toast({variant: "destructive", title: "Empty Cart", description: "Your cart is empty."});
        return;
     }
    
    const orderDetails = cart.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ');
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

    const sellerNotificationsKey = `userNotifications_Seller Example`;
    const sellerNotifications = loadData(sellerNotificationsKey, []);
    sellerNotifications.push({
      date: new Date().toISOString(),
      text: `New order placed by ${user.name}: ${orderDetails}. Total: ₹${totalAmount}.`,
      source: 'Store Order System'
    });
    saveData(sellerNotificationsKey, sellerNotifications);
    
    toast({ title: "Order Placed", description: "Your order has been received! The seller has been notified.", className: "bg-green-500 text-white" });
    setCart([]);
  };
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <ScrollArea className="h-full p-1">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow-xl bg-card/80 dark:bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-primary/90">Excellence Store</CardTitle>
              {canManageStore && (
                <Dialog open={showAddItemDialog} onOpenChange={(isOpen) => {
                    setShowAddItemDialog(isOpen); 
                    if (!isOpen) { setEditingItem(null); setNewItem({ name: '', price: '', description: '', image: null, imagePreview: null });}
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white"><PlusCircle className="mr-2 h-4 w-4"/>Add/Edit Item</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] bg-card/90 dark:bg-card/85 backdrop-blur-md">
                    <DialogHeader><DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item to Store'}</DialogTitle></DialogHeader>
                    <div className="grid gap-3 py-3">
                      <Label htmlFor="itemNameStore">Name</Label><Input id="itemNameStore" name="name" value={newItem.name} onChange={handleItemInputChange} />
                      <Label htmlFor="itemPriceStore">Price (₹)</Label><Input id="itemPriceStore" name="price" type="number" value={newItem.price} onChange={handleItemInputChange} />
                      <Label htmlFor="itemDescriptionStore">Description</Label><Textarea id="itemDescriptionStore" name="description" value={newItem.description} onChange={handleItemInputChange} rows={3}/>
                      <Label htmlFor="itemImageUploadStore">Image</Label><Input id="itemImageUploadStore" name="image" type="file" accept="image/*" onChange={handleItemImageUpload} className="text-sm"/>
                       {newItem.imagePreview && <img-replace src={newItem.imagePreview} alt="Preview" className="h-20 w-auto mt-1 border rounded"/>}
                       {!newItem.imagePreview && newItem.image && <p className="text-xs text-muted-foreground">Current file: {newItem.image}</p>}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowAddItemDialog(false); setEditingItem(null); setNewItem({ name: '', price: '', description: '', image: null, imagePreview: null }); }}>Cancel</Button>
                      <Button onClick={handleSaveItem}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <CardDescription>Browse items available in the store. Masters and Sellers can add new items.</CardDescription>
             <div className="mt-3 relative">
                <Input 
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
          </CardHeader>
        </Card>

        {user.type === 'student' && (
          <Card className="shadow-lg bg-card/75 dark:bg-card/65 backdrop-blur-sm sticky top-2 z-10">
            <CardHeader>
              <CardTitle className="text-lg text-primary/80 flex items-center"><ShoppingCart className="mr-2 h-5 w-5"/>Your Cart ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? <p className="text-sm text-muted-foreground">Your cart is empty.</p> : (
                <ScrollArea className="max-h-[150px]">
                  <ul className="space-y-1.5 text-sm">
                    {cart.map(item => (
                      <li key={item.id} className="flex justify-between items-center">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex justify-between items-center pt-3 border-t">
                <p className="text-md font-semibold">Total: ₹{cartTotal.toFixed(2)}</p>
                <Button onClick={handlePlaceOrder} size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Place Order</Button>
              </CardFooter>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No items found in the store or matching your search.</p>}
          {filteredItems.map(item => (
            <Card key={item.id} className="flex flex-col shadow-md bg-background/50 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted/50 dark:bg-muted/40 flex items-center justify-center rounded-t-md overflow-hidden">
                 {item.imagePreview ? <img-replace src={item.imagePreview} alt={item.name} className="w-full h-full object-cover"/> : <PackageOpen className="h-16 w-16 text-muted-foreground/50"/>}
                 {!item.imagePreview && item.image && <p className="absolute bottom-1 right-1 text-xs bg-black/30 text-white px-1 py-0.5 rounded text-center">{item.image}</p>}
              </div>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-md font-semibold">{item.name}</CardTitle>
                <CardDescription className="text-primary text-lg font-bold">₹{item.price.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground flex-grow pb-2">
                <p className="line-clamp-3">{item.description || "No description available."}</p>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                {user.type === 'student' && (
                  <Button size="xs" className="w-full text-xs" onClick={() => handleAddToCart(item)}><ShoppingCart className="mr-1.5 h-3.5 w-3.5"/>Add to Cart</Button>
                )}
                {canManageStore && (
                  <div className="flex w-full space-x-1.5">
                    <Button variant="outline" size="xs" className="w-full text-xs" onClick={() => handleEditItem(item)}><Edit3 className="mr-1.5 h-3.5 w-3.5"/>Edit</Button>
                    <Button variant="destructive" size="xs" className="w-full text-xs" onClick={() => handleDeleteItem(item.id)}><Trash2 className="mr-1.5 h-3.5 w-3.5"/>Delete</Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StorePage;
