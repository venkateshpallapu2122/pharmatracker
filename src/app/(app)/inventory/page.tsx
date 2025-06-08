
"use client";

import { InventoryTable } from "@/components/inventory/InventoryTable";
import type { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InventoryItemForm, type InventoryItemFormValues } from "@/components/inventory/InventoryItemForm";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, addDoc, writeBatch } from "firebase/firestore";

// Mock Data for seeding if collection is empty
const initialMockInventory: Omit<InventoryItem, 'id'>[] = [
  {
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    quantity: 150,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
    status: "In Stock",
    barcode: "AMX250-123",
  },
  {
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    quantity: 40,
    expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 5 days
    status: "Low Stock",
    barcode: "IBU400-456",
  },
  {
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    quantity: 200,
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 90 days
    status: "In Stock",
    barcode: "LIS10-789",
  },
  {
    name: "Metformin 500mg",
    category: "Diabetes",
    quantity: 0,
    expirationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Expired 10 days ago
    status: "Out of Stock",
    barcode: "MET500-012",
  },
];


export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formatFirebaseError = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code) {
        return `Firestore error (${firebaseError.code}): ${firebaseError.message || 'Unknown Firebase error'}`;
      } else if (firebaseError.message) {
        return `Error: ${firebaseError.message}`;
      }
    }
    return "An unexpected error occurred. Check console for details.";
  };

  const fetchInventoryItems = useCallback(async (seededItems?: InventoryItem[]) => {
    setIsLoading(true);
    try {
      if (seededItems) {
        setInventoryItems(seededItems);
        setIsLoading(false);
        return;
      }

      const querySnapshot = await getDocs(collection(db, "inventory"));
      if (querySnapshot.empty && process.env.NODE_ENV === 'development') { // Seed only if empty and in dev
        toast({ title: "No items found", description: "Seeding initial mock data..." });
        const batch = writeBatch(db);
        const addedItems: InventoryItem[] = [];

        for (const itemData of initialMockInventory) {
            const docRef = doc(collection(db, "inventory")); 
            const dataToSeed = {
                name: itemData.name,
                category: itemData.category,
                quantity: itemData.quantity,
                expirationDate: Timestamp.fromDate(new Date(itemData.expirationDate)),
                status: itemData.status,
                ...(itemData.barcode && { barcode: itemData.barcode }),
            };
            batch.set(docRef, dataToSeed);
            addedItems.push({ 
                id: docRef.id,
                ...itemData 
            });
        }
        await batch.commit();
        setInventoryItems(addedItems.sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()));
        toast({ title: "Mock Data Seeded", description: "Initial inventory created successfully." });
      } else {
        const items: InventoryItem[] = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            expirationDate: (data.expirationDate as Timestamp).toDate().toISOString(),
            status: data.status,
            barcode: data.barcode,
          };
        });
        setInventoryItems(items.sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()));
      }
    } catch (error) {
      console.error("Error fetching inventory items: ", error);
      toast({
        title: "Error Fetching Data",
        description: formatFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleAddNewItem = async (values: InventoryItemFormValues) => {
    setIsSubmitting(true);
    try {
      const newItemDataToFirestore: { [key: string]: any } = {
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        expirationDate: Timestamp.fromDate(values.expirationDate),
        status: values.status,
      };
      if (values.barcode && values.barcode.trim() !== "") {
        newItemDataToFirestore.barcode = values.barcode;
      }

      const docRef = await addDoc(collection(db, "inventory"), newItemDataToFirestore);
      
      const newItemForState: InventoryItem = {
        id: docRef.id,
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        expirationDate: values.expirationDate.toISOString(),
        status: values.status,
        ...(values.barcode && values.barcode.trim() !== "" && { barcode: values.barcode.trim() }),
      };
      setInventoryItems((prevItems) => [newItemForState, ...prevItems].sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()));

      toast({ title: "Item Added", description: `${values.name} has been added to the inventory.` });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding new item: ", error);
      toast({
        title: "Error Adding Item",
        description: formatFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    setIsSubmitting(true);
    try {
      const itemDocRef = doc(db, "inventory", updatedItem.id);
      
      const dataToUpdateFirestore: { [key: string]: any } = {
        name: updatedItem.name,
        category: updatedItem.category,
        quantity: updatedItem.quantity,
        expirationDate: Timestamp.fromDate(new Date(updatedItem.expirationDate)),
        status: updatedItem.status,
      };
      if (updatedItem.barcode && updatedItem.barcode.trim() !== "") {
        dataToUpdateFirestore.barcode = updatedItem.barcode.trim();
      } else {
         dataToUpdateFirestore.barcode = null; // Or use deleteField() if you want to remove it
      }

      await updateDoc(itemDocRef, dataToUpdateFirestore);
      
      setInventoryItems(prevItems =>
        prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
        .sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      );
      toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
    } catch (error) {
      console.error("Error updating item: ", error);
      toast({
        title: "Error Updating Item",
        description: formatFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = inventoryItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "inventory", itemId));
      setInventoryItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast({ title: "Item Deleted", description: `${itemToDelete.name} has been removed from the inventory.`, variant: "default" }); // Changed to default variant
    } catch (error) {
      console.error("Error deleting item: ", error);
      toast({
        title: "Error Deleting Item",
        description: formatFirebaseError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline text-primary">Inventory Overview</h2>
          <p className="text-muted-foreground font-body">Manage and track your pharmaceutical products.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => !isSubmitting && setIsAddDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto" disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Fill in the details of the new pharmaceutical product.
              </DialogDescription>
            </DialogHeader>
            <InventoryItemForm
              onSubmit={handleAddNewItem}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <InventoryTable
          items={inventoryItems}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

