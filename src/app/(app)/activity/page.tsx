
"use client";

import { ActivityLogTable } from "@/components/activity/ActivityLogTable";
import type { ActivityLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Added for feedback

// Mock Data
const mockActivityLogs: ActivityLog[] = [
  { id: "1", user: "Dr. Alice Wonderland", action: "Logged In", timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString() },
  { id: "2", user: "Bob The Builder", action: "Updated Inventory: Amoxicillin", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), details: { itemID: "1", field: "quantity", oldValue: 450, newValue: 500 } },
  { id: "3", user: "System", action: "Low stock alert: Ibuprofen", timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), details: { itemID: "2", currentQuantity: 20 } },
  { id: "4", user: "Carol Danvers", action: "Created Task: Monthly Audit", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), details: { taskID: "3" } },
  { id: "5", user: "Dr. Alice Wonderland", action: "Viewed Employee Profile: Bob The Builder", timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(), details: { employeeID: "2" } },
  { id: "6", user: "David Copperfield", action: "Marked Task Complete: Dispose Expired Meds", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), details: { taskID: "4" } },
  { id: "7", user: "System", action: "User David Copperfield password changed", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
];

export default function ActivityLogPage() {
  const { toast } = useToast();

  const handleExportLogs = () => {
    if (mockActivityLogs.length === 0) {
      toast({ title: "No logs to export", description: "The activity log is currently empty.", variant: "destructive" });
      return;
    }

    try {
      const headers = Object.keys(mockActivityLogs[0]).join(',');
      const csvRows = mockActivityLogs.map(log => {
        return (Object.values(log) as Array<string | number | Record<string, any> | undefined | null>).map(value => {
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`; // Escape double quotes within JSON string
          }
          return `"${String(value ?? '').replace(/"/g, '""')}"`; // Handle null/undefined and escape double quotes
        }).join(',');
      });

      const csvString = `${headers}\n${csvRows.join('\n')}`;
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "activity_logs.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Logs Exported", description: "activity_logs.csv has been downloaded." });
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast({ title: "Export Failed", description: "An error occurred while exporting logs.", variant: "destructive" });
    }
  };

  const handleRefreshLogs = () => {
    // In a real app, this would re-fetch logs
    toast({ title: "Logs Refreshed", description: "Activity log has been updated (mock)." });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline text-primary">Activity Log</h2>
          <p className="text-muted-foreground font-body">Review all actions performed within the platform.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshLogs}>
                <RotateCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={handleExportLogs} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Download className="mr-2 h-4 w-4" /> Export Logs
            </Button>
        </div>
      </div>
      <ActivityLogTable logs={mockActivityLogs} />
    </div>
  );
}

