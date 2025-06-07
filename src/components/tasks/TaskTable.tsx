"use client";

import type { Task } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, CheckCircle2, PlayCircle, Eye, Filter, ArrowDownUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TaskTableProps {
  tasks: Task[];
}

type SortField = keyof Task | null;
type SortDirection = "asc" | "desc";

export function TaskTable({ tasks: initialTasks }: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<Record<Task['status'], boolean>>({
    Pending: true,
    'In Progress': true,
    Completed: true,
  });

  const handleEdit = (task: Task) => {
    console.log("Edit task:", task);
    alert(`Editing ${task.title}. Implement dialog/form.`);
  };

  const handleDelete = (taskId: string) => {
    console.log("Delete task ID:", taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    alert(`Deleted task ${taskId}. Update Firebase.`);
  };

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };
  
  const getPriorityBadgeVariant = (priority: Task['priority']): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: Task['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pending': return 'destructive'; // Using destructive for pending for visibility
      case 'In Progress': return 'secondary';
      case 'Completed': return 'default'; // Using default (themed primary) for completed
      default: return 'outline';
    }
  };

  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(task => statusFilter[task.status]);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortField) return 0;
    
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    // Basic date sort (assuming YYYY-MM-DD or ISO strings)
    if (sortField === 'dueDate') {
         const dateA = new Date(valA as string).getTime();
         const dateB = new Date(valB as string).getTime();
         return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? ' ▲' : ' ▼';
    }
    return <ArrowDownUp className="inline ml-1 h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground" />;
  };


  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <Input 
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(statusFilter) as Array<Task['status']>).map(status => (
                    <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter[status]}
                        onCheckedChange={(checked) => setStatusFilter(prev => ({...prev, [status]: checked}))}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-headline cursor-pointer group" onClick={() => handleSort('title')}>Title {renderSortIcon('title')}</TableHead>
              <TableHead className="font-headline cursor-pointer group" onClick={() => handleSort('priority')}>Priority {renderSortIcon('priority')}</TableHead>
              <TableHead className="font-headline cursor-pointer group" onClick={() => handleSort('dueDate')}>Due Date {renderSortIcon('dueDate')}</TableHead>
              <TableHead className="font-headline cursor-pointer group" onClick={() => handleSort('status')}>Status {renderSortIcon('status')}</TableHead>
              <TableHead className="font-headline text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-xs truncate" title={task.title}>{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(task)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {task.status !== 'Completed' && (
                             <DropdownMenuItem>
                                {task.status === 'Pending' ? <PlayCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                {task.status === 'Pending' ? 'Start Task' : 'Mark Complete'}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No tasks found.
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
