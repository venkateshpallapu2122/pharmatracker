"use client";

import { InventoryTable } from "@/components/inventory/InventoryTable";
import type { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

// Mock Data
const mockInventoryItems: InventoryItem[] = [
  { id: "1", name: "Amoxicillin 250mg Tabs", category: "Antibiotics", quantity: 500, expirationDate: "2025-12-31", status: "In Stock" },
  { id: "2", name: "Ibuprofen 400mg Tabs", category: "Pain Relief", quantity: 20, expirationDate: "2024-10-31", status: "Low Stock" },
  { id: "3", name: "Lisinopril 10mg Tabs", category: "Cardiovascular", quantity: 300, expirationDate: "2026-06-30", status: "In Stock" },
  { id: "4", name: "Metformin 500mg Tabs", category: "Diabetes", quantity: 0, expirationDate: "2024-09-15", status: "Out of Stock" },
  { id: "5", name: "Saline Solution 0.9% IV Bag", category: "Intravenous Solutions", quantity: 150, expirationDate: "2025-08-01", status: "In Stock" },
  { id: "6", name: "Aspirin 81mg EC Tabs", category: "Pain Relief", quantity: 75, expirationDate: "2025-02-28", status: "In Stock" },
  { id: "7", name: "Insulin Syringes U-100", category: "Medical Supplies", quantity: 45, expirationDate: "2027-01-01", status: "Low Stock" },
];

export default function InventoryPage() {
  const handleAddItem = () => {
    // Placeholder for add item dialog/form
    alert("Add new item functionality to be implemented.");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline text-primary">Inventory Overview</h2>
          <p className="text-muted-foreground font-body">Manage and track your pharmaceutical products.</p>
        </div>
        <Button onClick={handleAddItem} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Item
        </Button>
      </div>
      <InventoryTable items={mockInventoryItems} />
    </div>
  );
}
