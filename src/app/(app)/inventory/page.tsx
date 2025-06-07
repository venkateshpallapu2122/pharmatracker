
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
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp, addDoc, writeBatch } from "firebase/firestore";

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
            const docRef = doc(collection(db, "inventory")); // Auto-generate ID
            batch.set(docRef, {
                ...itemData,
                expirationDate: Timestamp.fromDate(new Date(itemData.expirationDate)), // Store as Timestamp
            });
            // For local state, keep expirationDate as ISO string
            addedItems.push({ 
                id: docRef.id,
                ...itemData 
            });
        }
        await batch.commit();
        setInventoryItems(addedItems);
        toast({ title: "Mock Data Seeded", description: "Initial inventory created successfully." });
      } else {
        const items: InventoryItem[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            expirationDate: (data.expirationDate as Timestamp).toDate().toISOString(),
            status: data.status,
            barcode: data.barcode,
          };
        });
        setInventoryItems(items);
      }
    } catch (error) {
      console.error("Error fetching inventory items: ", error);
      toast({
        title: "Error Fetching Data",
        description: "Could not fetch inventory items from Firestore.",
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
      const newItemDataToFirestore = {
        ...values,
        expirationDate: Timestamp.fromDate(values.expirationDate), 
      };
      const docRef = await addDoc(collection(db, "inventory"), newItemDataToFirestore);
      
      const newItemForState: InventoryItem = {
        id: docRef.id,
        ...values,
        expirationDate: values.expirationDate.toISOString(),
      };
      setInventoryItems((prevItems) => [newItemForState, ...prevItems].sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()));

      toast({ title: "Item Added", description: `${values.name} has been added to the inventory.` });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding new item: ", error);
      toast({
        title: "Error Adding Item",
        description: "Could not add new item to Firestore.",
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
      const dataToUpdateFirestore = {
        ...updatedItem,
        expirationDate: Timestamp.fromDate(new Date(updatedItem.expirationDate)),
      };
      const { id, ...updatePayload } = dataToUpdateFirestore;

      await updateDoc(itemDocRef, updatePayload);
      
      setInventoryItems(prevItems =>
        prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
        .sort((a,b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
      );
      toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
    } catch (error) {
      console.error("Error updating item: ", error);
      toast({
        title: "Error Updating Item",
        description: "Could not update item in Firestore.",
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
      toast({ title: "Item Deleted", description: `${itemToDelete.name} has been removed from the inventory.`, variant: "destructive" });
    } catch (error) {
      console.error("Error deleting item: ", error);
      toast({
        title: "Error Deleting Item",
        description: "Could not delete item from Firestore.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline text-primary">Inventory Overview</h2>
          <p className="text-muted-foreground font-body">Manage and track your pharmaceutical products.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => !isSubmitting && setIsAddDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
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
