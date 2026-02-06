import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

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
