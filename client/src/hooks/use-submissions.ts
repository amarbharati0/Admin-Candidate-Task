import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type UpdateSubmissionData = z.infer<typeof api.submissions.update.input>;

export function useSubmissions(filters?: { taskId?: number; candidateId?: number }) {
  const queryKey = [api.submissions.list.path, filters?.taskId, filters?.candidateId].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.submissions.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.taskId) params.append("taskId", filters.taskId.toString());
        if (filters.candidateId) params.append("candidateId", filters.candidateId.toString());
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return await res.json();
    },
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.submissions.create.path, {
        method: "POST",
        body: formData, // Browser sets multipart/form-data header automatically
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] }); // To update task status
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSubmissionData }) => {
      const url = buildUrl(api.submissions.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to update submission");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
    },
  });
}
