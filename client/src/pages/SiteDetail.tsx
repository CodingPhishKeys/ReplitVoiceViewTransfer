import { Sidebar } from "@/components/Sidebar";
import { useSite, useDeleteSite, useUpdateSite } from "@/hooks/use-voiceview";
import { useRoute, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteOverview } from "@/components/SiteOverview";
import { SiteConnectivity } from "@/components/SiteConnectivity";
import { SiteServices } from "@/components/SiteServices";
import { SiteTelephony } from "@/components/SiteTelephony";
import { SiteDiagrams } from "@/components/SiteDiagrams";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSchema, regions, type Site } from "@shared/schema";
import type { z } from "zod";

export default function SiteDetail() {
  const [, params] = useRoute("/sites/:id");
  const [, navigate] = useLocation();
  const siteId = params ? parseInt(params.id) : 0;
  const { data, isLoading, error } = useSite(siteId);
  const deleteSite = useDeleteSite();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <SiteDetailSkeleton />;
  if (error || !data) return <div className="p-8 text-center text-red-500">Error loading site data</div>;

  const { connectivity, services, telephony, diagrams, ...site } = data;

  const handleDelete = () => {
    deleteSite.mutate(site.id, {
      onSuccess: () => {
        setConfirmOpen(false);
        navigate("/");
      }
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto pb-20">

          {/* Header */}
          <header className="mb-8 border-b border-border pb-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">{site.region} Region</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">{site.name}</h1>
                <p className="text-muted-foreground">{site.code} • Infrastructure Detail</p>
              </div>
              <div className="flex gap-2 mt-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit Site
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Site
                </Button>
              </div>
            </div>
          </header>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
              <TabsTrigger value="connectivity" className="rounded-lg">Connectivity</TabsTrigger>
              <TabsTrigger value="telephony" className="rounded-lg">Telephony</TabsTrigger>
              <TabsTrigger value="diagrams" className="rounded-lg">Diagrams</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SiteOverview site={site} />
            </TabsContent>
            <TabsContent value="services" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SiteServices siteId={site.id} services={services} />
            </TabsContent>
            <TabsContent value="connectivity" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SiteConnectivity siteId={site.id} data={connectivity} />
            </TabsContent>
            <TabsContent value="telephony" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SiteTelephony siteId={site.id} telephony={telephony} />
            </TabsContent>
            <TabsContent value="diagrams" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SiteDiagrams siteId={site.id} diagrams={diagrams} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Site Dialog */}
      <EditSiteDialog
        site={site}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Site
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{site.name}</strong>? This will permanently remove the site and all its associated data — connectivity, services, telephony systems, and diagrams. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSite.isPending}
            >
              {deleteSite.isPending ? "Deleting..." : "Yes, Delete Site"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditSiteDialog({ site, open, onOpenChange }: { site: Site; open: boolean; onOpenChange: (v: boolean) => void }) {
  const updateSite = useUpdateSite();
  const form = useForm<z.infer<typeof insertSiteSchema>>({
    resolver: zodResolver(insertSiteSchema),
    values: {
      name: site.name,
      region: site.region,
      code: site.code || "",
    }
  });

  const onSubmit = (data: z.infer<typeof insertSiteSchema>) => {
    updateSite.mutate({ id: site.id, ...data }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Edit Site
          </DialogTitle>
          <DialogDescription>Update the site name, region, or code.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Site Name</FormLabel>
                <FormControl><Input placeholder="e.g. London HQ" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Code</FormLabel>
                  <FormControl><Input placeholder="LON" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={updateSite.isPending}>
                {updateSite.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SiteDetailSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-slate-900 border-r border-slate-800 hidden md:block" />
      <main className="flex-1 p-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="grid grid-cols-3 gap-6 mt-8">
            <Skeleton className="h-48 col-span-2 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
