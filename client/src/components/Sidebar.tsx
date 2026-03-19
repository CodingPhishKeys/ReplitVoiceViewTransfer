import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Activity, 
  Plus, 
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Phone
} from "lucide-react";
import { useSites } from "@/hooks/use-voiceview";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSchema, regions, telephonySystems } from "@shared/schema";
import { useCreateSite } from "@/hooks/use-voiceview";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

export function Sidebar() {
  const [location] = useLocation();
  const { data: sites } = useSites();
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    "North": false,
    "South": false,
    "East": false,
    "West": false
  });
  const [expandedTelephony, setExpandedTelephony] = useState(false);

  const sitesByRegion = useMemo(() => {
    if (!sites) return {};
    const grouped: Record<string, typeof sites> = {};
    regions.forEach(r => grouped[r] = []);
    sites.forEach(site => {
      if (grouped[site.region]) {
        grouped[site.region].push(site);
      }
    });
    return grouped;
  }, [sites]);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-tight">VoiceView</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-1">
        <Link href="/" className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          location === "/" 
            ? "bg-blue-600/10 text-blue-400" 
            : "hover:bg-slate-800 hover:text-white"
        )}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Locations
        </div>

        {Object.entries(sitesByRegion).map(([region, regionSites]) => (
          <div key={region} className="space-y-1">
            <button
              onClick={() => toggleRegion(region)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
                {region}
              </div>
              {expandedRegions[region] ? (
                <ChevronDown className="h-3 w-3 opacity-50" />
              ) : (
                <ChevronRight className="h-3 w-3 opacity-50" />
              )}
            </button>
            
            {expandedRegions[region] && (
              <div className="ml-9 space-y-1 border-l border-slate-800 pl-2">
                {regionSites?.map(site => (
                  <Link 
                    key={site.id} 
                    href={`/sites/${site.id}`}
                    className={cn(
                      "block px-3 py-1.5 text-sm rounded-md transition-colors truncate",
                      location === `/sites/${site.id}`
                        ? "text-blue-400 font-medium bg-blue-900/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    {site.name}
                  </Link>
                ))}
                {(!regionSites || regionSites.length === 0) && (
                  <div className="px-3 py-1.5 text-xs text-slate-600 italic">No sites</div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Systems
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setExpandedTelephony(!expandedTelephony)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              Telephony
            </div>
            {expandedTelephony ? (
              <ChevronDown className="h-3 w-3 opacity-50" />
            ) : (
              <ChevronRight className="h-3 w-3 opacity-50" />
            )}
          </button>
          
          {expandedTelephony && (
            <div className="ml-9 space-y-1 border-l border-slate-800 pl-2">
              {telephonySystems.map(system => (
                <Link
                  key={system}
                  href={`/telephony/${encodeURIComponent(system)}`}
                  className={cn(
                    "block px-3 py-1.5 text-sm rounded-md transition-colors",
                    location === `/telephony/${encodeURIComponent(system)}`
                      ? "text-blue-400 font-medium bg-blue-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  {system}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Add Site */}
      <div className="p-4 border-t border-slate-800">
        <CreateSiteDialog />
      </div>
    </div>
  );
}

function CreateSiteDialog() {
  const [open, setOpen] = useState(false);
  const createSite = useCreateSite();
  const form = useForm<z.infer<typeof insertSiteSchema>>({
    resolver: zodResolver(insertSiteSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "North",
    }
  });

  const onSubmit = (data: z.infer<typeof insertSiteSchema>) => {
    createSite.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 border-0">
          <Plus className="h-4 w-4 mr-2" /> Add New Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. London HQ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Code</FormLabel>
                    <FormControl>
                      <Input placeholder="LON" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief details about this site..." 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createSite.isPending}>
              {createSite.isPending ? "Creating..." : "Create Site"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
