import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type InsertSite, 
  type InsertConnectivity, 
  type InsertService, 
  type InsertTelephony, 
  type InsertDiagram,
  type InsertSiteInfo,
  type InsertDocument,
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

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: InsertSite & { id: number }) => {
      const res = await fetch(buildUrl(api.sites.update.path, { id }), {
        method: api.sites.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update site");
      const json = await res.json();
      return { id, ...json } as { id: number; name: string; region: string; code: string };
    },
    onSuccess: (updated) => {
      // Update the sites list cache immediately
      queryClient.setQueryData([api.sites.list.path], (old: any[]) =>
        old ? old.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)) : old
      );
      // Update the full site detail cache immediately
      queryClient.setQueryData([api.sites.get.path, updated.id], (old: any) =>
        old ? { ...old, ...updated } : old
      );
      // Also trigger background refetch to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [api.sites.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, updated.id] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl(api.sites.delete.path, { id }), {
        method: api.sites.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete site");
    },
    onSuccess: (_, id) => {
      // Immediately remove site from the list cache so sidebar updates instantly
      queryClient.setQueryData([api.sites.list.path], (old: any[]) =>
        old ? old.filter((s) => s.id !== id) : []
      );
      queryClient.removeQueries({ queryKey: [api.sites.get.path, id] });
    },
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

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, siteId, ...data }: Omit<InsertService, "siteId"> & { id: number; siteId: number }) => {
      const url = buildUrl(api.services.update.path, { id });
      const res = await fetch(url, {
        method: api.services.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update service");
      return api.services.update.responses[200].parse(await res.json());
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
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] });
    },
  });
}

// === Telephony ===

export function useTelephonyByPlatform(platform: string) {
  return useQuery({
    queryKey: [api.telephony.byPlatform.path, platform],
    queryFn: async () => {
      const url = buildUrl(api.telephony.byPlatform.path, { platform: encodeURIComponent(platform) });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch telephony by platform");
      return api.telephony.byPlatform.responses[200].parse(await res.json());
    },
    enabled: !!platform,
  });
}

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

export function useUpdateTelephony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, siteId, ...data }: Omit<InsertTelephony, "siteId"> & { id: number; siteId: number }) => {
      const url = buildUrl(api.telephony.update.path, { id });
      const res = await fetch(url, {
        method: api.telephony.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update telephony system");
      return api.telephony.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useDeleteTelephony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.telephony.delete.path, { id });
      const res = await fetch(url, { method: api.telephony.delete.method });
      if (!res.ok) throw new Error("Failed to delete telephony system");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] });
    },
  });
}

// === Info ===

export function useAddSiteInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertSiteInfo & { siteId: number }) => {
      const url = buildUrl(api.info.create.path, { siteId });
      const res = await fetch(url, {
        method: api.info.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add site info");
      return api.info.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useUpdateSiteInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, siteId, ...data }: Omit<InsertSiteInfo, "siteId"> & { id: number; siteId: number }) => {
      const url = buildUrl(api.info.update.path, { id });
      const res = await fetch(url, {
        method: api.info.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update site info");
      return api.info.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useDeleteSiteInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.info.delete.path, { id });
      const res = await fetch(url, { method: api.info.delete.method });
      if (!res.ok) throw new Error("Failed to delete site info");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] });
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

export function useUpdateDiagram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, siteId, ...data }: Omit<InsertDiagram, "siteId"> & { id: number; siteId: number }) => {
      const url = buildUrl(api.diagrams.update.path, { id });
      const res = await fetch(url, {
        method: api.diagrams.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update diagram");
      return api.diagrams.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useDeleteDiagram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.diagrams.delete.path, { id });
      const res = await fetch(url, { method: api.diagrams.delete.method });
      if (!res.ok) throw new Error("Failed to delete diagram");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] });
    },
  });
}

// === Documents ===

export function useAddDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, ...data }: InsertDocument & { siteId: number }) => {
      const url = buildUrl(api.documents.create.path, { siteId });
      const res = await fetch(url, {
        method: api.documents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add document");
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, siteId, ...data }: Omit<InsertDocument, "siteId"> & { id: number; siteId: number }) => {
      const url = buildUrl(api.documents.update.path, { id });
      const res = await fetch(url, {
        method: api.documents.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update document");
      return api.documents.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path, variables.siteId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.documents.delete.path, { id });
      const res = await fetch(url, { method: api.documents.delete.method });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sites.get.path] });
    },
  });
}
