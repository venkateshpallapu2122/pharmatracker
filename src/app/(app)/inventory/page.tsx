
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
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp, addDoc } from "firebase/firestore";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchInventoryItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const items: InventoryItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          // Firestore Timestamps need to be converted to ISO strings
          expirationDate: (data.expirationDate as Timestamp).toDate().toISOString(),
          status: data.status,
          barcode: data.barcode,
        };
      });
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory items: ", error);
      toast({
        title: "Error",
        description: "Could not fetch inventory items.",
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
      const newItemData = {
        ...values,
        expirationDate: Timestamp.fromDate(values.expirationDate), // Store as Firestore Timestamp
      };
      const docRef = await addDoc(collection(db, "inventory"), newItemData);
      
      // Add the new item to local state with the new ID and converted date
      const newItemWithId: InventoryItem = {
        id: docRef.id,
        ...values,
        expirationDate: values.expirationDate.toISOString(),
      };
      setInventoryItems((prevItems) => [newItemWithId, ...prevItems]);

      toast({ title: "Item Added", description: `${values.name} has been added to the inventory.` });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding new item: ", error);
      toast({
        title: "Error",
        description: "Could not add new item.",
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
      const dataToUpdate = {
        ...updatedItem,
        expirationDate: Timestamp.fromDate(new Date(updatedItem.expirationDate)),
      };
      // remove id from data to update as it's the doc ref
      const { id, ...updatePayload } = dataToUpdate;

      await updateDoc(itemDocRef, updatePayload);
      
      setInventoryItems(prevItems =>
        prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
    } catch (error) {
      console.error("Error updating item: ", error);
      toast({
        title: "Error",
        description: "Could not update item.",
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
        title: "Error",
        description: "Could not delete item.",
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
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
