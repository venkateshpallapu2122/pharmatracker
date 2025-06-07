import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ActivityLog } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityItemProps {
  activity: ActivityLog;
}

export function RecentActivityItem({ activity }: RecentActivityItemProps) {
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-4 py-3 px-1 hover:bg-muted/50 rounded-md transition-colors">
      <Avatar className="h-10 w-10 border">
        <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(activity.user)}`} alt={activity.user} data-ai-hint="user avatar"/>
        <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1 text-sm">
        <p className="font-medium text-foreground leading-tight">{activity.action}</p>
        <p className="text-xs text-muted-foreground">
          By {activity.user} - {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
