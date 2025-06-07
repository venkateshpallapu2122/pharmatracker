
"use client"

import * as React from "react";
import type { HTMLAttributes } from "react"; // This line is kept for explicit type import as per original structure, but could use React.HTMLAttributes directly.
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps extends React.HTMLAttributes<HTMLButtonElement> {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean; // Added disabled prop
}

export function DatePicker({ date, setDate, className, disabled, ...props }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled} // Pass disabled prop
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled || props.disabled} // Pass disabled prop to Calendar
        />
      </PopoverContent>
    </Popover>
  )
}
