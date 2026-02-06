import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useUsers(role?: "admin" | "candidate") {
  return useQuery({
    queryKey: [api.users.list.path, role],
    queryFn: async () => {
      let url = api.users.list.path;
      if (role) {
        url += `?role=${role}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: [api.users.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.users.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch user");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const url = buildUrl(api.users.get.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });
}
