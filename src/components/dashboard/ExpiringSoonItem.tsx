import type { ExpirationAlert } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ExpiringSoonItemProps {
  item: ExpirationAlert;
}

export function ExpiringSoonItem({ item }: ExpiringSoonItemProps) {
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  if (item.daysToExpiry < 7) {
    badgeVariant = "destructive";
  } else if (item.daysToExpiry < 30) {
    badgeVariant = "secondary"; // Or some warning color
  }


  return (
    <div className="flex items-center justify-between gap-4 py-3 px-1 hover:bg-muted/50 rounded-md transition-colors">
      <div className="flex items-center gap-3">
        <AlertTriangle className={`h-5 w-5 ${item.daysToExpiry < 7 ? 'text-destructive' : 'text-amber-500'}`} />
        <div>
          <p className="text-sm font-medium text-foreground leading-tight">{item.itemName}</p>
          <p className="text-xs text-muted-foreground">Expires on: {new Date(item.expirationDate).toLocaleDateString()}</p>
        </div>
      </div>
      <Badge variant={badgeVariant} className="text-xs">
        {item.daysToExpiry} days left
      </Badge>
    </div>
  );
}
