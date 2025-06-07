"use client";

import { TaskTable } from "@/components/tasks/TaskTable";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";

// Mock Data
const mockTasks: Task[] = [
  { id: "1", title: "Restock Paracetamol 500mg", description: "Current stock is low, order 1000 units.", dueDate: "2024-08-10", priority: "High", status: "Pending", assignedTo: "Alice" },
  { id: "2", title: "Perform Refrigerator Temperature Check", description: "Log daily temperature for cold storage unit #3.", dueDate: "2024-08-05", priority: "Medium", status: "In Progress", assignedTo: "Bob" },
  { id: "3", title: "Monthly Inventory Audit", description: "Full audit of Schedule H drugs.", dueDate: "2024-08-25", priority: "High", status: "Pending" },
  { id: "4", title: "Dispose of Expired Medications", description: "Check items expiring this month and follow disposal protocol.", dueDate: "2024-08-15", priority: "Medium", status: "Completed", assignedTo: "Carol" },
  { id: "5", title: "Train New Technician", description: "Onboard David on dispensary software.", dueDate: "2024-08-12", priority: "Low", status: "In Progress", assignedTo: "Alice" },
  { id: "6", title: "Update Supplier Contact List", description: "Verify and update contacts for all major suppliers.", dueDate: "2024-09-01", priority: "Low", status: "Pending" },
];

export default function TasksPage() {
  const handleAddTask = () => {
    // Placeholder for add task dialog/form
    alert("Add new task functionality to be implemented.");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline text-primary">Task Management</h2>
          <p className="text-muted-foreground font-body">Organize, assign, and track all pharmacy tasks.</p>
        </div>
        <Button onClick={handleAddTask} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <ListPlus className="mr-2 h-5 w-5" /> Create New Task
        </Button>
      </div>
      <TaskTable tasks={mockTasks} />
    </div>
  );
}
