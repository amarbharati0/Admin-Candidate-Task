import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAttendance(filters?: { userId?: number; taskId?: number }) {
  return useQuery({
    queryKey: ["/api/attendance", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", filters.userId.toString());
      if (filters?.taskId) params.append("taskId", filters.taskId.toString());
      
      const res = await fetch(`/api/attendance?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return await res.json();
    },
  });
}

export function useMarkAttendance() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to mark attendance");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Attendance Marked",
        description: "Your attendance has been recorded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
