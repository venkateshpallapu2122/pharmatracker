
"use client";

import { InventoryTable } from "@/components/inventory/InventoryTable";
import type { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
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

// Initial Mock Data
const initialMockInventoryItems: InventoryItem[] = [
  { id: "1", name: "Amoxicillin 250mg Tabs", category: "Antibiotics", quantity: 500, expirationDate: new Date(Date.now() + 86400000 * 150).toISOString(), status: "In Stock", barcode: "123456789012" },
  { id: "2", name: "Ibuprofen 400mg Tabs", category: "Pain Relief", quantity: 20, expirationDate: new Date(Date.now() + 86400000 * 60).toISOString(), status: "Low Stock", barcode: "234567890123" },
  { id: "3", name: "Lisinopril 10mg Tabs", category: "Cardiovascular", quantity: 300, expirationDate: new Date(Date.now() + 86400000 * 300).toISOString(), status: "In Stock" },
  { id: "4", name: "Metformin 500mg Tabs", category: "Diabetes", quantity: 0, expirationDate: new Date(Date.now() + 86400000 * 45).toISOString(), status: "Out of Stock" },
  { id: "5", name: "Saline Solution 0.9% IV Bag", category: "Intravenous Solutions", quantity: 150, expirationDate: new Date(Date.now() + 86400000 * 200).toISOString(), status: "In Stock" },
];

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialMockInventoryItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddNewItem = (values: InventoryItemFormValues) => {
    const newItem: InventoryItem = {
      id: String(Date.now()), // Simple ID generation for mock
      ...values,
      expirationDate: values.expirationDate.toISOString(),
    };
    setInventoryItems((prevItems) => [newItem, ...prevItems]);
    toast({ title: "Item Added", description: `${newItem.name} has been added to the inventory.` });
    setIsAddDialogOpen(false);
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventoryItems(prevItems => 
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.`});
  };

  const handleDeleteItem = (itemId: string) => {
    const itemName = inventoryItems.find(item => item.id === itemId)?.name || "Item";
    setInventoryItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({ title: "Item Deleted", description: `${itemName} has been removed from the inventory.`, variant: "destructive" });
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
            />
          </DialogContent>
        </Dialog>
      </div>
      <InventoryTable 
        items={inventoryItems} 
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
