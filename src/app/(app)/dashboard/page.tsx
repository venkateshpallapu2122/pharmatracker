
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityItem } from "@/components/dashboard/RecentActivityItem";
import { ExpiringSoonItem } from "@/components/dashboard/ExpiringSoonItem";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Boxes, ListChecks, Users, AlertTriangle, Activity } from "lucide-react";
import type { ActivityLog, ExpirationAlert, Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data
const mockInventorySummary = {
  totalItems: 1250,
  lowStock: 45,
  outOfStock: 12,
};

const mockUrgentTasks: Task[] = [
  { id: "1", title: "Restock Paracetamol", description: "Order 500 units", dueDate: "2024-08-15", priority: "High", status: "Pending" },
  { id: "2", title: "Audit Controlled Substances", description: "Monthly audit required", dueDate: "2024-08-20", priority: "High", status: "In Progress" },
];

const mockEmployeeStatus = {
  active: 25,
  onLeave: 2,
};

const mockRecentActivity: ActivityLog[] = [
  { id: "1", user: "Alice Smith", action: "Logged in", timestamp: new Date(Date.now() - 3600000 * 0.1).toISOString() },
  { id: "2", user: "Bob Johnson", action: "Updated inventory: Aspirin", timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: "3", user: "Alice Smith", action: "Completed task: Check Refrigerator Temp", timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: "4", user: "System", action: "Scheduled backup initiated", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
];

const mockExpiringSoon: ExpirationAlert[] = [
  { id: "1", itemName: "Amoxicillin 250mg", daysToExpiry: 5, expirationDate: new Date(Date.now() + 86400000 * 5).toISOString() },
  { id: "2", itemName: "Insulin Glargine", daysToExpiry: 12, expirationDate: new Date(Date.now() + 86400000 * 12).toISOString() },
  { id: "3", itemName: "Saline Solution 0.9%", daysToExpiry: 25, expirationDate: new Date(Date.now() + 86400000 * 25).toISOString() },
];


export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Inventory Items" 
          value={mockInventorySummary.totalItems} 
          icon={Boxes} 
          description={`${mockInventorySummary.lowStock} low stock, ${mockInventorySummary.outOfStock} out of stock`}
          className="bg-card"
        />
        <StatCard 
          title="Urgent Tasks" 
          value={mockUrgentTasks.length} 
          icon={ListChecks} 
          description="High priority tasks needing attention"
          className="bg-card"
        />
        <StatCard 
          title="Active Employees" 
          value={mockEmployeeStatus.active} 
          icon={Users}
          description={`${mockEmployeeStatus.onLeave} on leave`}
          className="bg-card"
        />
        <StatCard 
          title="Expiring Soon" 
          value={mockExpiringSoon.filter(item => item.daysToExpiry < 30).length} 
          icon={AlertTriangle}
          description="Items nearing expiration date"
          className="bg-card"
          iconClassName="text-destructive"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="font-headline text-xl">Urgent Tasks</CardTitle>
              <CardDescription>Tasks requiring immediate attention.</CardDescription>
            </div>
            <Link href="/tasks" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">View All Tasks</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {mockUrgentTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUrgentTasks.slice(0, 5).map((task) => (
                      <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={task.status === "Pending" ? "destructive" : "secondary"}>
                            {task.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No urgent tasks at the moment.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Expiring Soon</CardTitle>
            <CardDescription>Items that need to be prioritized.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-96 overflow-y-auto">
            {mockExpiringSoon.length > 0 ? mockExpiringSoon.map((item) => (
              <ExpiringSoonItem key={item.id} item={item} />
            )) : (
              <p className="text-sm text-muted-foreground">No items expiring soon.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
              <CardDescription>Latest actions performed in the system.</CardDescription>
            </div>
            <Link href="/activity" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">View Full Log</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 max-h-96 overflow-y-auto">
             {mockRecentActivity.length > 0 ? mockRecentActivity.map((activity) => (
              <RecentActivityItem key={activity.id} activity={activity} />
            )) : (
               <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

