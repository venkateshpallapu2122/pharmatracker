
"use client";

import { TaskTable } from "@/components/tasks/TaskTable";
import type { Task, Employee } from "@/lib/types"; // Assuming Employee type is also in types.ts
import { Button } from "@/components/ui/button";
import { ListPlus, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm, type TaskFormValues } from "@/components/tasks/TaskForm";
import { useToast } from "@/hooks/use-toast";

// Initial Mock Data
const initialMockTasks: Task[] = [
  { id: "1", title: "Restock Paracetamol 500mg", description: "Current stock is low, order 1000 units.", dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), priority: "High", status: "Pending", assignedTo: "Alice Wonderland" },
  { id: "2", title: "Perform Refrigerator Temperature Check", description: "Log daily temperature for cold storage unit #3.", dueDate: new Date(Date.now() + 1 * 86400000).toISOString(), priority: "Medium", status: "In Progress", assignedTo: "Bob The Builder" },
  { id: "3", title: "Monthly Inventory Audit", description: "Full audit of Schedule H drugs.", dueDate: new Date(Date.now() + 20 * 86400000).toISOString(), priority: "High", status: "Pending" },
  { id: "4", title: "Dispose of Expired Medications", description: "Check items expiring this month and follow disposal protocol.", dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), priority: "Medium", status: "Completed", assignedTo: "Carol Danvers" },
  { id: "5", title: "Train New Technician", description: "Onboard David on dispensary software.", dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), priority: "Low", status: "In Progress", assignedTo: "Alice Wonderland" },
  { id: "6", title: "Update Supplier Contact List", description: "Verify and update contacts for all major suppliers.", dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), priority: "Low", status: "Pending" },
];

// Mock employee data for assignment dropdown
const mockEmployeesForTasks: Pick<Employee, 'id' | 'name'>[] = [
    { id: "1", name: "Alice Wonderland" },
    { id: "2", name: "Bob The Builder" },
    { id: "3", name: "Carol Danvers" },
    { id: "4", name: "David Copperfield" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateTaskSubmit = (values: TaskFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newTask: Task = {
        id: String(Date.now()), // Simple unique ID
        ...values,
        dueDate: values.dueDate.toISOString(), // Ensure dueDate is string
      };
      setTasks(prev => [newTask, ...prev].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      toast({ title: "Task Created", description: `Task "${values.title}" has been added.` });
      setIsCreateTaskDialogOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline text-primary">Task Management</h2>
          <p className="text-muted-foreground font-body">Organize, assign, and track all pharmacy tasks.</p>
        </div>
        <Dialog open={isCreateTaskDialogOpen} onOpenChange={(open) => !isSubmitting && setIsCreateTaskDialogOpen(open)}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto" disabled={isSubmitting} suppressHydrationWarning>
              <ListPlus className="mr-2 h-5 w-5" /> Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Create New Task</DialogTitle>
              <DialogDescription>
                Fill in the details for the new task.
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              onSubmit={handleCreateTaskSubmit}
              onCancel={() => setIsCreateTaskDialogOpen(false)}
              isSubmitting={isSubmitting}
              employees={mockEmployeesForTasks}
            />
          </DialogContent>
        </Dialog>
      </div>
      <TaskTable tasks={tasks} />
    </div>
  );
}
