
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { InventoryItem } from "@/lib/types";
import { Barcode, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(2, { message: "Category is required." }),
  quantity: z.coerce.number().min(0, { message: "Quantity cannot be negative." }),
  expirationDate: z.date({ required_error: "Expiration date is required." }),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock'], { required_error: "Status is required." }),
  barcode: z.string().optional(),
});

export type InventoryItemFormValues = z.infer<typeof formSchema>;

interface InventoryItemFormProps {
  onSubmit: (values: InventoryItemFormValues) => Promise<void> | void;
  initialData?: Partial<InventoryItemFormValues> & { expirationDate?: string | Date };
  onCancel: () => void;
  isEditMode?: boolean;
  isSubmitting?: boolean;
}

export function InventoryItemForm({ onSubmit, initialData, onCancel, isEditMode = false, isSubmitting = false }: InventoryItemFormProps) {
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      quantity: initialData?.quantity || 0,
      expirationDate: initialData?.expirationDate ? new Date(initialData.expirationDate) : undefined,
      status: initialData?.status || "In Stock",
      barcode: initialData?.barcode || "",
    },
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (!showScanner) {
         if (stream && videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
          }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the barcode scanner.',
        });
        setShowScanner(false); // Hide scanner if permission denied
      }
    };

    getCameraPermission();

    return () => {
      if (stream && videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [showScanner, toast]);


  const handleToggleScanner = () => {
    if (showScanner && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setShowScanner(prev => !prev);
    setHasCameraPermission(null); // Reset permission status on toggle
  };
  
  const handleScanSuccess = (scannedBarcode: string) => {
    form.setValue("barcode", scannedBarcode);
    toast({ title: "Barcode Scanned", description: `Barcode: ${scannedBarcode}` });
    setShowScanner(false);
  };

  const internalOnSubmit = async (values: InventoryItemFormValues) => {
    await onSubmit(values);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(internalOnSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Amoxicillin 250mg" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Antibiotics" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 100" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiration Date</FormLabel>
              <DatePicker date={field.value} setDate={field.onChange} disabled={isSubmitting} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Barcode (Optional)</FormLabel>
                <div className="flex items-center gap-2">
                    <FormControl>
                        <Input placeholder="Enter or scan barcode" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={handleToggleScanner} className="shrink-0" disabled={isSubmitting || showScanner}>
                        <Camera className="mr-2 h-4 w-4" /> {showScanner ? "Close Scanner" : "Scan"}
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )}
        />

        {showScanner && (
          <div className="space-y-2">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use the barcode scanner.
                  You might need to refresh the page after granting permission.
                </AlertDescription>
              </Alert>
            )}
             {hasCameraPermission === true && (
                <Button type="button" onClick={() => handleScanSuccess(`SIMULATED_SCAN_${Date.now()}`)} className="w-full" disabled={isSubmitting}>
                    Simulate Scan Success
                </Button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditMode ? "Save Changes" : "Add Item")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
