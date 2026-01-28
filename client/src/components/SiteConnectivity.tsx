import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, Wifi, Server, User, Globe } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConnectivitySchema, type SiteConnectivity as SiteConnectivityType } from "@shared/schema";
import { useUpdateConnectivity } from "@/hooks/use-voiceview";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Props {
  siteId: number;
  data: SiteConnectivityType | null;
}

export function SiteConnectivity({ siteId, data }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const updateConnectivity = useUpdateConnectivity();
  
  const form = useForm<z.infer<typeof insertConnectivitySchema>>({
    resolver: zodResolver(insertConnectivitySchema.omit({ siteId: true })),
    defaultValues: {
      linkType: data?.linkType || "",
      ispName: data?.ispName || "",
      ispContact: data?.ispContact || "",
      localItContact: data?.localItContact || ""
    }
  });

  const onSubmit = (values: any) => {
    updateConnectivity.mutate({ siteId, ...values }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  if (isEditing) {
    return (
      <Card className="shadow-md border-primary/20">
        <CardHeader>
          <CardTitle>Edit Connectivity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MPLS, Fiber, 5G" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ispName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISP Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BT, Verizon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="ispContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISP Contact Details</FormLabel>
                    <FormControl>
                      <Input placeholder="Support number or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localItContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local IT Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Name, Number or Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={updateConnectivity.isPending}>
                  {updateConnectivity.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed border-border">
        <Wifi className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">No Connectivity Data</h3>
        <p className="text-muted-foreground mb-6">Add ISP and link details for this site.</p>
        <Button onClick={() => setIsEditing(true)}>Add Details</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Primary Link
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Connection Type</Label>
              <div className="text-2xl font-bold text-foreground mt-1">{data.linkType}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Service Provider</Label>
              <div className="text-2xl font-bold text-foreground mt-1">{data.ispName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-slate-400">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" /> ISP Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-md font-mono">
            {data.ispContact}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" /> Local IT Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md font-medium">
            {data.localItContact}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
