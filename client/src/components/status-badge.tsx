import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  let variant = "secondary";
  let className = "";

  switch (normalizedStatus) {
    case "active":
    case "approved":
      variant = "default"; // Re-using default for success-like states in this theme setup
      className = "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      break;
    case "rejected":
    case "archived":
      variant = "destructive";
      className = "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none";
      break;
    case "pending":
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
      break;
    default:
      className = "bg-slate-100 text-slate-700 border-slate-200";
  }

  return (
    <Badge variant="outline" className={`capitalize font-medium px-2.5 py-0.5 border ${className}`}>
      {status}
    </Badge>
  );
}
