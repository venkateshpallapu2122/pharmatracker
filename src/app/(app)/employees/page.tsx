import { EmployeeCard } from "@/components/employees/EmployeeCard";
import type { Employee } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock Data
const mockEmployees: Employee[] = [
  { id: "1", name: "Dr. Alice Wonderland", role: "Chief Pharmacist", email: "alice.w@example.com", avatarUrl: "https://placehold.co/100x100.png?text=AW" },
  { id: "2", name: "Bob The Builder", role: "Pharmacy Technician", email: "bob.b@example.com", avatarUrl: "https://placehold.co/100x100.png?text=BB" },
  { id: "3", name: "Carol Danvers", role: "Dispensary Manager", email: "carol.d@example.com", avatarUrl: "https://placehold.co/100x100.png?text=CD" },
  { id: "4", name: "David Copperfield", role: "Logistics Coordinator", email: "david.c@example.com", avatarUrl: "https://placehold.co/100x100.png?text=DC" },
  { id: "5", name: "Eve Harrington", role: "Customer Service Rep", email: "eve.h@example.com", avatarUrl: "https://placehold.co/100x100.png?text=EH" },
  { id: "6", name: "Frankenstein Monster", role: "Night Shift Pharmacist", email: "frank.m@example.com", avatarUrl: "https://placehold.co/100x100.png?text=FM" },
];

export default function EmployeesPage() {
  const handleAddEmployee = () => {
    // Placeholder for add employee dialog/form
    alert("Add new employee functionality to be implemented.");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-headline text-primary">Employee Directory</h2>
          <p className="text-muted-foreground font-body">Browse and manage employee profiles.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Search employees..." className="pl-10 w-full md:w-64" />
          </div>
          <Button onClick={handleAddEmployee} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <UserPlus className="mr-2 h-5 w-5" /> Add Employee
          </Button>
        </div>
      </div>

      {mockEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      ) : (
         <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No employees found.</p>
            <Button onClick={handleAddEmployee} className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                <UserPlus className="mr-2 h-5 w-5" /> Add First Employee
            </Button>
        </div>
      )}
    </div>
  );
}
