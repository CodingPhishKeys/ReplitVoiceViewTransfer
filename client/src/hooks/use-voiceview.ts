import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertSite, 
  type InsertConnectivity, 
  type InsertService, 
  type InsertTelephony, 
  type InsertDiagram 
} from "@shared/schema";

// === Sites ===

export function useSites() {
  return useQuery({
    queryKey: [api.sites.list.path],
    queryFn: async () => {
      const res = await fetch(api.sites.list.path);
      if (!res.ok) throw new Error("Failed to fetch sites");
      return api.sites.list.responses[200].parse(await res.json());
    },
  });
}

export function useSite(id: number) {
  return useQuery({
    queryKey: [api.sites.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.sites.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch site details");
      return api.sites.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSite) => {
      const res = await fetch(api.sites.create.path, {
        method: api.sites.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create site");
      }
      return api.sites.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
    },
  });
}

// === Connectivity ===

export function useUpdateConnectivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertConnectivity & { siteId: number }) => {
      const url = buildUrl(api.connectivity.update.path, { siteId });
      const res = await fetch(url, {
        method: api.connectivity.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update connectivity");
      return api.connectivity.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

// === Services ===

export function useAddService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertService & { siteId: number }) => {
      const url = buildUrl(api.services.create.path, { siteId });
      const res = await fetch(url, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add service");
      return api.services.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(url, { method: api.services.delete.method });
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] }); // Broad invalidation to be safe, or pass siteId
    },
  });
}

// === Telephony ===

export function useAddTelephony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertTelephony & { siteId: number }) => {
      const url = buildUrl(api.telephony.create.path, { siteId });
      const res = await fetch(url, {
        method: api.telephony.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add telephony system");
      return api.telephony.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

// === Diagrams ===

export function useAddDiagram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertDiagram & { siteId: number }) => {
      const url = buildUrl(api.diagrams.create.path, { siteId });
      const res = await fetch(url, {
        method: api.diagrams.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add diagram");
      return api.diagrams.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}
