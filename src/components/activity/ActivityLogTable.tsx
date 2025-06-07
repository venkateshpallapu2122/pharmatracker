"use client";

import type { ActivityLog } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Eye, Filter, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ActivityLogTableProps {
  logs: ActivityLog[];
}

export function ActivityLogTable({ logs: initialLogs }: ActivityLogTableProps) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearchTerm = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (log.details && Object.values(log.details).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesDate = !date || new Date(log.timestamp).toDateString() === date.toDateString();
    return matchesSearchTerm && matchesDate;
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input 
          placeholder="Search logs (user, action, details)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? new Date(date).toLocaleDateString() : <span>Filter by date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <Card className="shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-headline w-[200px]">User</TableHead>
              <TableHead className="font-headline">Action</TableHead>
              <TableHead className="font-headline">Details</TableHead>
              <TableHead className="font-headline text-right">Timestamp</TableHead>
              <TableHead className="font-headline text-right w-[100px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                         <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(log.user)}`} alt={log.user} data-ai-hint="user system"/>
                        <AvatarFallback>{getInitials(log.user)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={log.details ? JSON.stringify(log.details) : ''}>
                    {log.details ? JSON.stringify(log.details) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => alert(`Details for log: ${log.id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No activity logs found for the selected criteria.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Minimal Card component for structure
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground ${className}`}>
    {children}
  </div>
);
