
"use client"; // Ensure this is at the top

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ExpirationAlert, InventoryItem } from "@/lib/types";
import { AlertTriangle, CalendarClock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"; // Ensure useEffect is imported

// Helper functions (can remain at module level as they are pure)
function calculateDaysToExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0); // Normalize expiry to start of day
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const generateExpirationAlerts = (items: InventoryItem[]): ExpirationAlert[] => {
  return items.map(item => ({
    id: item.id,
    itemName: item.name,
    daysToExpiry: calculateDaysToExpiry(item.expirationDate),
    expirationDate: item.expirationDate,
  })).sort((a,b) => a.daysToExpiry - b.daysToExpiry); // Sort by soonest to expire
};

export default function ExpirationTrackerPage() {
  const [filterDays, setFilterDays] = useState<string>("all");
  const [expirationAlerts, setExpirationAlerts] = useState<ExpirationAlert[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock Data - Initialize inside useEffect to use client's Date.now() consistently
    const mockInventoryItemsForExpiry: InventoryItem[] = [
      { id: "1", name: "Amoxicillin 250mg Tabs", category: "Antibiotics", quantity: 500, expirationDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: "In Stock" },
      { id: "2", name: "Ibuprofen 400mg Tabs", category: "Pain Relief", quantity: 20, expirationDate: new Date(Date.now() + 86400000 * 12).toISOString(), status: "Low Stock" },
      { id: "3", name: "Lisinopril 10mg Tabs", category: "Cardiovascular", quantity: 300, expirationDate: new Date(Date.now() + 86400000 * 25).toISOString(), status: "In Stock" },
      { id: "4", name: "Metformin 500mg Tabs", category: "Diabetes", quantity: 0, expirationDate: new Date(Date.now() + 86400000 * 40).toISOString(), status: "Out of Stock" },
      { id: "5", name: "Saline Solution 0.9% IV Bag", category: "Intravenous Solutions", quantity: 150, expirationDate: new Date(Date.now() + 86400000 * 65).toISOString(), status: "In Stock" },
      { id: "6", name: "Aspirin 81mg EC Tabs", category: "Pain Relief", quantity: 75, expirationDate: new Date(Date.now() + 86400000 * 92).toISOString(), status: "In Stock" },
      { id: "7", name: "Expired Item Example", category: "Test", quantity: 10, expirationDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: "In Stock" },
    ];
    setExpirationAlerts(generateExpirationAlerts(mockInventoryItemsForExpiry));
  }, []); // Empty dependency array, runs once on mount

  const filteredAlerts = expirationAlerts.filter(alert => {
    if (filterDays === "all") return true;
    if (filterDays === "expired") return alert.daysToExpiry < 0;
    return alert.daysToExpiry >= 0 && alert.daysToExpiry <= parseInt(filterDays);
  });
  
  const getBadgeVariant = (days: number): "default" | "secondary" | "destructive" | "outline" => {
    if (days < 0) return "destructive"; // Expired
    if (days < 7) return "destructive"; // Critical
    if (days < 30) return "secondary"; // Warning (using secondary as warning)
    return "default"; // OK
  };

  const getDaysText = (days: number): string => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return "Expires today";
    return `Expires in ${days} days`;
  };
  
  if (!mounted) {
    // Render nothing or a placeholder until mounted to avoid hydration issues with dynamic data
    // For this page, showing a loading state or empty table is reasonable.
    // Returning null is simplest for ensuring no mismatch.
    // Or render the structure with a loading indicator.
    return (
        <div className="space-y-8 animate-fadeIn">
             <div className="flex justify-between items-center">
                <div>
                <h2 className="text-3xl font-headline text-primary flex items-center">
                    <CalendarClock className="mr-3 h-8 w-8" /> Expiration Tracker
                </h2>
                <p className="text-muted-foreground font-body">Monitor product expiration dates to ensure safety and compliance.</p>
                </div>
             </div>
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Upcoming Expirations</CardTitle>
                    <CardDescription>
                        Loading expiration data...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10">
                        <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                        <p className="mt-4 text-lg text-muted-foreground">Loading data...</p>
                    </div>
                </CardContent>
             </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline text-primary flex items-center">
            <CalendarClock className="mr-3 h-8 w-8" /> Expiration Tracker
          </h2>
          <p className="text-muted-foreground font-body">Monitor product expiration dates to ensure safety and compliance.</p>
        </div>
        <div className="flex items-center gap-4">
            <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by expiry" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="7">Next 7 Days</SelectItem>
                    <SelectItem value="30">Next 30 Days</SelectItem>
                    <SelectItem value="90">Next 90 Days</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
                <Bell className="mr-2 h-4 w-4" /> Manage Alerts
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Upcoming Expirations</CardTitle>
          <CardDescription>
            List of products sorted by their expiration date. Take necessary actions for items nearing expiry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead className="font-headline">Product Name</TableHead>
                  <TableHead className="font-headline">Expiration Date</TableHead>
                  <TableHead className="font-headline text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <AlertTriangle 
                        className={`h-6 w-6 ${
                          alert.daysToExpiry < 0 ? 'text-destructive' : 
                          alert.daysToExpiry < 7 ? 'text-destructive' : 
                          alert.daysToExpiry < 30 ? 'text-yellow-500' : 'text-green-500'
                        }`} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{alert.itemName}</TableCell>
                    <TableCell>{new Date(alert.expirationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getBadgeVariant(alert.daysToExpiry)}>
                        {getDaysText(alert.daysToExpiry)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No items match current filter or data is still loading.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
