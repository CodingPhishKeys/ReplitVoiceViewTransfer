import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSites } from "@/hooks/use-voiceview";
import { telephonySystems, phoneNumberStatuses, type PhoneNumber } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPhoneNumberSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Plus, Pencil, Trash2, Search, Upload, ChevronLeft, ChevronRight, X, Hash, Pencil as EditIcon
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Reserved: "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Ported Out": "bg-red-100 text-red-600 border-red-200",
};

type PagedResult = { data: PhoneNumber[]; total: number; page: number; limit: number; totalPages: number };

function usePhoneNumbers(params: { page: number; limit: number; search: string; platform: string; siteId: string; status: string }) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.platform) query.set("platform", params.platform);
  if (params.siteId) query.set("siteId", params.siteId);
  if (params.status) query.set("status", params.status);
  return useQuery<PagedResult>({
    queryKey: ["/api/phone-numbers", params],
    queryFn: async () => {
      const res = await fetch(`/api/phone-numbers?${query}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}

function useCreatePhoneNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertPhoneNumberSchema>) => {
      const res = await fetch("/api/phone-numbers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

function useUpdatePhoneNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<z.infer<typeof insertPhoneNumberSchema>> & { id: number }) => {
      const res = await fetch(`/api/phone-numbers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

function useDeletePhoneNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/phone-numbers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await fetch("/api/phone-numbers/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows) });
      if (!res.ok) throw new Error("Import failed");
      return res.json() as Promise<{ inserted: number; skipped: number }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

function useBulkDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch("/api/phone-numbers/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      if (!res.ok) throw new Error("Bulk delete failed");
      return res.json() as Promise<{ deleted: number }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

function useBulkUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: Record<string, any> }) => {
      const res = await fetch("/api/phone-numbers/bulk-update", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, updates }) });
      if (!res.ok) throw new Error("Bulk update failed");
      return res.json() as Promise<{ updated: number }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/phone-numbers"] }),
  });
}

export default function PhoneNumbers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [siteId, setSiteId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: sites } = useSites();
  const bulkImport = useBulkImport();
  const deleteNum = useDeletePhoneNumber();
  const bulkDelete = useBulkDelete();
  const bulkUpdate = useBulkUpdate();

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Clear selection when page changes
  useEffect(() => { setSelectedIds(new Set()); }, [page, debouncedSearch, platform, siteId, status]);

  const { data, isLoading } = usePhoneNumbers({ page, limit: 50, search: debouncedSearch, platform, siteId, status });
  const siteMap = Object.fromEntries((sites || []).map(s => [s.id, s]));
  const hasFilters = !!debouncedSearch || !!platform || !!siteId || !!status;
  const pageIds = data?.data.map(n => n.id) ?? [];
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const somePageSelected = pageIds.some(id => selectedIds.has(id));

  function toggleSelectAll() {
    if (allPageSelected) {
      setSelectedIds(prev => { const next = new Set(prev); pageIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelectedIds(prev => { const next = new Set(prev); pageIds.forEach(id => next.add(id)); return next; });
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function clearFilters() {
    setSearch(""); setDebouncedSearch(""); setPlatform(""); setSiteId(""); setStatus(""); setPage(1);
  }

  function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { toast({ title: "Empty file", variant: "destructive" }); return; }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
      const numIdx = headers.findIndex(h => h === "number" || h === "phonenumber" || h === "phone");
      if (numIdx === -1) { toast({ title: "CSV must have a 'number' column", variant: "destructive" }); return; }
      const platIdx = headers.findIndex(h => h === "platform");
      const siteColIdx = headers.findIndex(h => h.includes("site"));
      const descIdx = headers.findIndex(h => h.includes("desc"));
      const statusIdx = headers.findIndex(h => h.includes("status"));
      const siteNameMap = Object.fromEntries((sites || []).map(s => [s.name.toLowerCase(), s.id]));
      const siteCodeMap = Object.fromEntries((sites || []).map(s => [(s.code ?? "").toLowerCase(), s.id]));
      const rows = lines.slice(1).map(line => {
        const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        const siteVal = siteColIdx !== -1 ? cols[siteColIdx]?.toLowerCase() : undefined;
        const resolvedSiteId = siteVal ? (siteNameMap[siteVal] ?? siteCodeMap[siteVal] ?? undefined) : undefined;
        return {
          number: cols[numIdx],
          platform: platIdx !== -1 ? cols[platIdx] || undefined : undefined,
          siteId: resolvedSiteId,
          description: descIdx !== -1 ? cols[descIdx] || undefined : undefined,
          status: statusIdx !== -1 ? cols[statusIdx] || "Active" : "Active",
        };
      }).filter(r => r.number);
      if (rows.length === 0) { toast({ title: "No valid rows found", variant: "destructive" }); return; }
      bulkImport.mutate(rows, {
        onSuccess: (result) => toast({ title: "Import complete", description: `${result.inserted} added, ${result.skipped} skipped` }),
        onError: () => toast({ title: "Import failed", variant: "destructive" }),
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Phone Number Management</h1>
                <p className="text-sm text-muted-foreground">
                  {data ? `${data.total.toLocaleString()} numbers total` : "Loading..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
              <a href="/phone-numbers-template.csv" download="phone-numbers-template.csv">
                <Button variant="ghost" size="sm" type="button">Download Template</Button>
              </a>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={bulkImport.isPending}>
                <Upload className="h-4 w-4 mr-2" />
                {bulkImport.isPending ? "Importing..." : "Import CSV"}
              </Button>
              <AddNumberDialog sites={sites || []} />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b bg-slate-50/80 px-6 py-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search numbers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 bg-white" />
            </div>
            <Select value={platform} onValueChange={v => { setPlatform(v === "__all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-44 bg-white text-sm"><SelectValue placeholder="All Platforms" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All Platforms</SelectItem>
                {telephonySystems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={siteId} onValueChange={v => { setSiteId(v === "__all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-44 bg-white text-sm"><SelectValue placeholder="All Sites" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All Sites</SelectItem>
                {(sites || []).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={v => { setStatus(v === "__all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="h-8 w-36 bg-white text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All Statuses</SelectItem>
                {phoneNumberStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedCount > 0 && (
          <div className="border-b bg-blue-50 px-6 py-2.5 shrink-0 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">{selectedCount.toLocaleString()} selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs border-blue-200 bg-white hover:bg-blue-50"
                onClick={() => setBulkEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Selected
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-600 bg-white hover:bg-red-50"
                onClick={() => setBulkDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Selected
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                onClick={() => setSelectedIds(new Set())}>
                <X className="h-3.5 w-3.5 mr-1" /> Deselect All
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b z-10">
              <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all on page"
                    className={somePageSelected && !allPageSelected ? "data-[state=unchecked]:bg-blue-100" : ""}
                  />
                </th>
                <th className="px-2 py-3">Phone Number</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}</tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Hash className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No phone numbers found</p>
                    {hasFilters && <p className="text-sm text-muted-foreground/60 mt-1">Try clearing the filters</p>}
                  </td>
                </tr>
              ) : (
                data?.data.map(num => (
                  <NumberRow key={num.id} num={num} siteMap={siteMap} sites={sites || []}
                    selected={selectedIds.has(num.id)}
                    onToggle={() => toggleSelect(num.id)}
                    onDelete={() => setDeleteId(num.id)}
                    isDeleting={deleteNum.isPending && deleteId === num.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="border-t bg-white px-6 py-3 flex items-center justify-between shrink-0">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, data.total)} of {data.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Bulk Delete confirm */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedCount.toLocaleString()} Numbers</DialogTitle>
            <DialogDescription>This will permanently remove the selected phone numbers. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={bulkDelete.isPending}
              onClick={() => bulkDelete.mutate(Array.from(selectedIds), {
                onSuccess: (r) => {
                  setBulkDeleteOpen(false);
                  setSelectedIds(new Set());
                  toast({ title: `Deleted ${r.deleted.toLocaleString()} numbers` });
                }
              })}>
              {bulkDelete.isPending ? "Deleting..." : `Delete ${selectedCount.toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit dialog */}
      <BulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedCount={selectedCount}
        sites={sites || []}
        onSubmit={(updates) => bulkUpdate.mutate({ ids: Array.from(selectedIds), updates }, {
          onSuccess: (r) => {
            setBulkEditOpen(false);
            setSelectedIds(new Set());
            toast({ title: `Updated ${r.updated.toLocaleString()} numbers` });
          }
        })}
        isPending={bulkUpdate.isPending}
      />

      {/* Single delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Delete Number</DialogTitle>
            <DialogDescription>This will permanently remove this phone number.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={deleteNum.isPending}
              onClick={() => { if (deleteId !== null) deleteNum.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}>
              {deleteNum.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NumberRow({ num, siteMap, sites, selected, onToggle, onDelete, isDeleting }: {
  num: PhoneNumber; siteMap: Record<number, any>; sites: any[];
  selected: boolean; onToggle: () => void; onDelete: () => void; isDeleting: boolean;
}) {
  return (
    <tr className={`group transition-colors ${selected ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
      <td className="px-4 py-3">
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label="Select row" />
      </td>
      <td className="px-2 py-3 font-mono font-medium text-slate-900">{num.number}</td>
      <td className="px-4 py-3 text-slate-600">{num.platform || <span className="text-muted-foreground/40">—</span>}</td>
      <td className="px-4 py-3 text-slate-600">
        {num.siteId ? siteMap[num.siteId]?.name || `Site ${num.siteId}` : <span className="text-muted-foreground/40">—</span>}
      </td>
      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{num.description || <span className="text-muted-foreground/40">—</span>}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[num.status] || statusColors.Active}`}>
          {num.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
          <EditNumberDialog num={num} sites={sites} />
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function NumberFormFields({ form, sites }: { form: any; sites: any[] }) {
  return (
    <>
      <FormField control={form.control} name="number" render={({ field }) => (
        <FormItem>
          <FormLabel>Phone Number</FormLabel>
          <FormControl><Input placeholder="+44 20 7946 0000" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="platform" render={({ field }) => (
          <FormItem>
            <FormLabel>Platform</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>{telephonySystems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "Active"}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>{phoneNumberStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="siteId" render={({ field }) => (
        <FormItem>
          <FormLabel>Site (optional)</FormLabel>
          <Select onValueChange={v => field.onChange(v === "__none" ? null : Number(v))} value={field.value ? String(field.value) : "__none"}>
            <FormControl><SelectTrigger><SelectValue placeholder="No site" /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="__none">No site</SelectItem>
              {sites.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="description" render={({ field }) => (
        <FormItem>
          <FormLabel>Description (optional)</FormLabel>
          <FormControl><Input placeholder="e.g. Main reception line" {...field} value={field.value || ""} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  );
}

function AddNumberDialog({ sites }: { sites: any[] }) {
  const [open, setOpen] = useState(false);
  const create = useCreatePhoneNumber();
  const form = useForm<z.infer<typeof insertPhoneNumberSchema>>({
    resolver: zodResolver(insertPhoneNumberSchema),
    defaultValues: { number: "", platform: "", siteId: null, description: "", status: "Active" },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Number</Button>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader><DialogTitle>Add Phone Number</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => create.mutate(d, { onSuccess: () => { setOpen(false); form.reset(); } }))} className="space-y-4 pt-2">
            <NumberFormFields form={form} sites={sites} />
            <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? "Saving..." : "Add Number"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function EditNumberDialog({ num, sites }: { num: PhoneNumber; sites: any[] }) {
  const [open, setOpen] = useState(false);
  const update = useUpdatePhoneNumber();
  const form = useForm<z.infer<typeof insertPhoneNumberSchema>>({
    resolver: zodResolver(insertPhoneNumberSchema),
    defaultValues: { number: num.number, platform: num.platform || "", siteId: num.siteId || null, description: num.description || "", status: num.status },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader><DialogTitle>Edit Phone Number</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => update.mutate({ id: num.id, ...d }, { onSuccess: () => setOpen(false) }))} className="space-y-4 pt-2">
            <NumberFormFields form={form} sites={sites} />
            <Button type="submit" className="w-full" disabled={update.isPending}>{update.isPending ? "Saving..." : "Save Changes"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const KEEP = "__keep__";

function BulkEditDialog({ open, onOpenChange, selectedCount, sites, onSubmit, isPending }: {
  open: boolean; onOpenChange: (v: boolean) => void; selectedCount: number;
  sites: any[]; onSubmit: (updates: Record<string, any>) => void; isPending: boolean;
}) {
  const [platform, setPlatform] = useState(KEEP);
  const [siteId, setSiteId] = useState(KEEP);
  const [status, setStatus] = useState(KEEP);
  const [description, setDescription] = useState("");
  const [changeDesc, setChangeDesc] = useState(false);

  function handleSubmit() {
    const updates: Record<string, any> = {};
    if (platform !== KEEP) updates.platform = platform === "__clear" ? null : platform;
    if (siteId !== KEEP) updates.siteId = siteId === "__clear" ? null : Number(siteId);
    if (status !== KEEP) updates.status = status;
    if (changeDesc) updates.description = description || null;
    if (Object.keys(updates).length === 0) { onOpenChange(false); return; }
    onSubmit(updates);
  }

  // Reset state when dialog opens
  useEffect(() => {
    if (open) { setPlatform(KEEP); setSiteId(KEEP); setStatus(KEEP); setDescription(""); setChangeDesc(false); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit {selectedCount.toLocaleString()} Numbers</DialogTitle>
          <DialogDescription>Only fields you change will be updated. Leave a field on "Don't change" to keep existing values.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={KEEP}>Don't change</SelectItem>
                <SelectItem value="__clear">Clear (remove platform)</SelectItem>
                {telephonySystems.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Site</label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={KEEP}>Don't change</SelectItem>
                <SelectItem value="__clear">Clear (remove site)</SelectItem>
                {sites.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={KEEP}>Don't change</SelectItem>
                {phoneNumberStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Checkbox id="change-desc" checked={changeDesc} onCheckedChange={v => setChangeDesc(!!v)} />
              <label htmlFor="change-desc" className="text-sm font-medium cursor-pointer">Update description</label>
            </div>
            {changeDesc && (
              <Input placeholder="New description (leave blank to clear)" value={description} onChange={e => setDescription(e.target.value)} />
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Updating..." : `Update ${selectedCount.toLocaleString()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
