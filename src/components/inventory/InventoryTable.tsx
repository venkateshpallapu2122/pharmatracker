
"use client";

import type { InventoryItem } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Loader2, ArrowDownUp } from "lucide-react"; // Added ArrowDownUp
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
// Removed Select and DatePicker imports for column filters
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InventoryItemForm, type InventoryItemFormValues } from "./InventoryItemForm";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateItem: (item: InventoryItem) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  isSubmitting?: boolean;
}

type SortField = keyof InventoryItem | 'actions' | null; // 'actions' is not sortable
type SortDirection = "asc" | "desc";

export function InventoryTable({ items, onUpdateItem, onDeleteItem, isSubmitting = false }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState(""); // Global search remains

  // State for sorting
  const [sortField, setSortField] = useState<SortField>("expirationDate"); // Default sort
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: InventoryItemFormValues) => {
    if (!selectedItem) return;
    const updatedItem: InventoryItem = {
      ...selectedItem,
      ...values,
      expirationDate: values.expirationDate.toISOString(),
    };
    await onUpdateItem(updatedItem);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const confirmDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (selectedItem) {
      await onDeleteItem(selectedItem.id);
      setIsDeleteAlertOpen(false);
      setSelectedItem(null);
    }
  };

  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return new Date(dateString).toDateString();
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleSort = (field: keyof InventoryItem) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const renderSortIcon = (field: keyof InventoryItem) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return <ArrowDownUp className="inline ml-1 h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground" />;
  };

  const sortedAndFilteredItems = useMemo(() => {
    let itemsToDisplay = items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return searchLower === "" ||
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchLower)) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.quantity.toString().includes(searchLower) ||
        formatDate(item.expirationDate).toLowerCase().includes(searchLower);
    });

    if (sortField && sortField !== 'actions') {
      itemsToDisplay.sort((a, b) => {
        const valA = a[sortField as keyof InventoryItem];
        const valB = b[sortField as keyof InventoryItem];

        let comparison = 0;

        if (valA === null || valA === undefined) comparison = -1;
        else if (valB === null || valB === undefined) comparison = 1;
        else if (sortField === 'expirationDate') {
          comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        }
        return sortDirection === 'asc' ? comparison : comparison * -1;
      });
    }
    return itemsToDisplay;
  }, [items, searchTerm, sortField, sortDirection, mounted]); // added mounted to re-evaluate formatDate


  const getStatusBadgeVariant = (status: InventoryItem['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'In Stock':
        return 'default'; 
      case 'Low Stock':
        return 'secondary'; 
      case 'Out of Stock':
        return 'destructive';
      default:
        return 'outline';
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input 
          placeholder="Global search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs md:max-w-sm"
          suppressHydrationWarning
        />
        {/* Removed "Clear Column Filters" button */}
      </div>
      <Card className="shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-headline min-w-[200px] cursor-pointer group" onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </TableHead>
                <TableHead className="font-headline hidden sm:table-cell min-w-[150px] cursor-pointer group" onClick={() => handleSort('category')}>
                  Category {renderSortIcon('category')}
                </TableHead>
                <TableHead className="font-headline text-right min-w-[120px] cursor-pointer group" onClick={() => handleSort('quantity')}>
                  Quantity {renderSortIcon('quantity')}
                </TableHead>
                <TableHead className="font-headline hidden md:table-cell min-w-[180px] cursor-pointer group" onClick={() => handleSort('expirationDate')}>
                  Expiration Date {renderSortIcon('expirationDate')}
                </TableHead>
                <TableHead className="font-headline hidden lg:table-cell min-w-[150px] cursor-pointer group" onClick={() => handleSort('barcode')}>
                  Barcode {renderSortIcon('barcode')}
                </TableHead>
                <TableHead className="font-headline min-w-[150px] cursor-pointer group" onClick={() => handleSort('status')}>
                  Status {renderSortIcon('status')}
                </TableHead>
                <TableHead className="font-headline text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredItems.length > 0 ? (
                sortedAndFilteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium truncate max-w-xs" title={item.name}>{item.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(item.expirationDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{item.barcode || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isSubmitting}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(item)} disabled={isSubmitting}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)} disabled={isSubmitting}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDelete(item)} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isSubmitting}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No inventory items match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => !isSubmitting && setIsEditModalOpen(open)}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of {selectedItem?.name || "the item"}.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <InventoryItemForm
              onSubmit={handleEditSubmit}
              initialData={{...selectedItem, expirationDate: selectedItem.expirationDate}}
              onCancel={() => { setIsEditModalOpen(false); setSelectedItem(null); }}
              isEditMode
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Item Details Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle className="font-headline text-xl">Item Details: {selectedItem?.name}</DialogTitle>
              </DialogHeader>
              {selectedItem && (
                  <div className="space-y-3 py-4 text-sm">
                      <p><strong>ID:</strong> {selectedItem.id}</p>
                      <p><strong>Name:</strong> {selectedItem.name}</p>
                      <p><strong>Category:</strong> {selectedItem.category}</p>
                      <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
                      <p><strong>Expiration Date:</strong> {formatDate(selectedItem.expirationDate)}</p>
                      <p><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(selectedItem.status)}>{selectedItem.status}</Badge></p>
                      <p><strong>Barcode:</strong> {selectedItem.barcode || "N/A"}</p>
                  </div>
              )}
              <Button onClick={() => setIsViewModalOpen(false)} variant="outline" className="w-full">Close</Button>
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={(open) => !isSubmitting && setIsDeleteAlertOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item "{selectedItem?.name}" from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Minimal Card component for structure
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);
