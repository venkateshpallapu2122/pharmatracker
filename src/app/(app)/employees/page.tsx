

"use client";

import { EmployeeCard } from "@/components/employees/EmployeeCard";
import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmployeeForm, type EmployeeFormValues } from "@/components/employees/EmployeeForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // For RBAC

// Initial Mock Data
const initialMockEmployees: Employee[] = [
  { id: "1", name: "Dr. Alice Wonderland", role: "Chief Pharmacist", email: "alice.w@example.com", avatarUrl: "https://placehold.co/100x100.png?text=AW" },
  { id: "2", name: "Bob The Builder", role: "Pharmacy Technician", email: "bob.b@example.com", avatarUrl: "https://placehold.co/100x100.png?text=BB" },
  { id: "3", name: "Carol Danvers", role: "Dispensary Manager", email: "carol.d@example.com", avatarUrl: "https://placehold.co/100x100.png?text=CD" },
  { id: "4", name: "David Copperfield", role: "Logistics Coordinator", email: "david.c@example.com", avatarUrl: "https://placehold.co/100x100.png?text=DC" },
  { id: "5", name: "Eve Harrington", role: "Customer Service Rep", email: "eve.h@example.com", avatarUrl: "https://placehold.co/100x100.png?text=EH" },
  { id: "6", name: "Frankenstein Monster", role: "Night Shift Pharmacist", email: "frank.m@example.com", avatarUrl: "https://placehold.co/100x100.png?text=FM" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialMockEmployees);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth(); // Get user for RBAC

  const handleAddEmployeeSubmit = (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newEmployee: Employee = {
        id: String(Date.now()), // Simple unique ID for mock
        ...values,
        avatarUrl: `https://placehold.co/100x100.png?text=${values.name.substring(0,2).toUpperCase()}` // Placeholder avatar
      };
      setEmployees(prev => [newEmployee, ...prev]);
      toast({ title: "Employee Added", description: `${values.name} has been added to the directory.` });
      setIsAddEmployeeDialogOpen(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline text-primary">Employee Directory</h2>
          <p className="text-muted-foreground font-body">Browse and manage employee profiles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search employees..." 
              className="pl-10 w-full sm:w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning
            />
          </div>
          {user?.role === 'admin' && (
            <Dialog open={isAddEmployeeDialogOpen} onOpenChange={(open) => !isSubmitting && setIsAddEmployeeDialogOpen(open)}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto" disabled={isSubmitting} suppressHydrationWarning>
                  <UserPlus className="mr-2 h-5 w-5" /> Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline text-xl">Add New Employee</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new employee.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm
                  onSubmit={handleAddEmployeeSubmit}
                  onCancel={() => setIsAddEmployeeDialogOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">
              {searchTerm ? "No employees match your search." : "No employees found."}
            </p>
            {user?.role === 'admin' && !searchTerm && (
                <Button onClick={() => setIsAddEmployeeDialogOpen(true)} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90" suppressHydrationWarning>
                    <UserPlus className="mr-2 h-5 w-5" /> Add First Employee
                </Button>
            )}
        </div>
      )}
    </div>
  );
}
