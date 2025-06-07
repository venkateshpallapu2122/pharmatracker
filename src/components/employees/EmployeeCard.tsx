import type { Employee } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, UserCog } from "lucide-react";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-out transform hover:-translate-y-1">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20 shadow-md">
          <AvatarImage src={employee.avatarUrl || `https://placehold.co/100x100.png`} alt={employee.name} data-ai-hint="employee person"/>
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl font-headline text-primary">{employee.name}</CardTitle>
        <CardDescription className="text-base text-accent-foreground/80">{employee.role}</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-3 pt-2">
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Mail className="w-4 h-4 mr-2 text-primary/70" />
          <span>{employee.email}</span>
        </div>
        {/* Placeholder for phone or other contact info */}
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2 text-primary/70" />
          <span>(555) 123-4567</span> {/* Placeholder */}
        </div>
        <div className="pt-3">
          <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:border-accent">
            <UserCog className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
