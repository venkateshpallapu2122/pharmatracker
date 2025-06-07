import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ title, value, icon: Icon, description, className, iconClassName }: StatCardProps) {
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 ease-out", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-body text-card-foreground/80">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline text-primary">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1 font-body">{description}</p>}
      </CardContent>
    </Card>
  );
}

// Helper for cn if not globally available in this context
// (usually it is via "@/lib/utils")
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
