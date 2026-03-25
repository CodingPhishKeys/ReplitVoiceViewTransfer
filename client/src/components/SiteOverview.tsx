import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Hash, Info, Plus, User, Users, FileText, Phone, Trash2, Pencil, Clock } from "lucide-react";
import type { Site, SiteInfo } from "@shared/schema";
import { timeSlots } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteInfoSchema, operatingDaysOptions } from "@shared/schema";
import { useAddSiteInfo, useUpdateSiteInfo, useDeleteSiteInfo } from "@/hooks/use-voiceview";
import type { z } from "zod";

type SiteWithDetails = Site & { info: SiteInfo[] };

export function SiteOverview({ site }: { site: SiteWithDetails }) {
  const deleteInfo = useDeleteSiteInfo();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2 border-l-4 border-l-primary shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            General Information
          </CardTitle>
          <AddInfoDialog siteId={site.id} />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {site.info && site.info.length > 0 ? (
              <div className="grid gap-4">
                {site.info.map((info) => (
                  <div key={info.id} className="relative group bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {info.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Address</p>
                            <p className="text-sm">{info.address}</p>
                          </div>
                        </div>
                      )}
                      {info.mainNumber && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Main Number</p>
                            <p className="text-sm">{info.mainNumber}</p>
                          </div>
                        </div>
                      )}
                      {info.itManager && (
                        <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">IT Manager</p>
                            <p className="text-sm">{info.itManager}</p>
                          </div>
                        </div>
                      )}
                      {info.numberOfUsers && (
                        <div className="flex items-start gap-3">
                          <Users className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Number of Users</p>
                            <p className="text-sm">{info.numberOfUsers}</p>
                          </div>
                        </div>
                      )}
                      {(info.operatingDays || info.openingTime || info.closingTime) && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Operating Hours</p>
                            {info.operatingDays && (
                              <p className="text-sm font-medium">{info.operatingDays}</p>
                            )}
                            <p className="text-sm">
                              {info.openingTime && info.closingTime
                                ? `${info.openingTime} – ${info.closingTime}`
                                : info.openingTime
                                  ? `Opens ${info.openingTime}`
                                  : info.closingTime
                                    ? `Closes ${info.closingTime}`
                                    : ""}
                            </p>
                          </div>
                        </div>
                      )}
                      {info.otherInfo && (
                        <div className="flex items-start gap-3 col-span-full">
                          <FileText className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Other Info</p>
                            <p className="text-sm whitespace-pre-wrap">{info.otherInfo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditInfoDialog info={info} siteId={site.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteInfo.mutate(info.id)}
                        disabled={deleteInfo.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground leading-relaxed text-center py-8">
                No detailed information added for this site yet.
              </p>
            )}

            <div className="pt-4 border-t border-border/50 flex flex-wrap gap-4">
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Region</p>
                  <p className="font-semibold text-foreground">{site.region}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                  <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Site Code</p>
                  <p className="font-semibold text-foreground">{site.code || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon />
            System Status
          </CardTitle>
          <CardDescription>Real-time availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium">Network</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Online</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-medium">Telephony</span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Online</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Services</span>
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Warning</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SiteInfoForm({ form, onSubmit, isPending, submitLabel }: {
  form: any;
  onSubmit: any;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl><Input placeholder="123 Corporate Way..." {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="mainNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>Main Number</FormLabel>
              <FormControl><Input placeholder="+44 20..." {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="itManager" render={({ field }) => (
            <FormItem>
              <FormLabel>IT Manager</FormLabel>
              <FormControl><Input placeholder="Name..." {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="numberOfUsers" render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Users</FormLabel>
            <FormControl><Input placeholder="e.g. 250" {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Operating Days */}
        <FormField control={form.control} name="operatingDays" render={({ field }) => (
          <FormItem>
            <FormLabel>Operating Days</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select days" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {operatingDaysOptions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Opening / Closing Times */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="openingTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Time</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {timeSlots.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="closingTime" render={({ field }) => (
            <FormItem>
              <FormLabel>Closing Time</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {timeSlots.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="otherInfo" render={({ field }) => (
          <FormItem>
            <FormLabel>Other Info</FormLabel>
            <FormControl><Input placeholder="Access hours, local quirks..." {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

function AddInfoDialog({ siteId }: { siteId: number }) {
  const [open, setOpen] = useState(false);
  const addInfo = useAddSiteInfo();

  const form = useForm<z.infer<typeof insertSiteInfoSchema>>({
    resolver: zodResolver(insertSiteInfoSchema),
    defaultValues: { siteId, address: "", mainNumber: "", itManager: "", numberOfUsers: "", operatingDays: "", openingTime: "", closingTime: "", otherInfo: "" }
  });

  const onSubmit = (data: z.infer<typeof insertSiteInfoSchema>) => {
    addInfo.mutate({ ...data, siteId }, {
      onSuccess: () => { setOpen(false); form.reset(); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Add Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Site Information</DialogTitle>
          <DialogDescription>Add general details and operating hours for this site.</DialogDescription>
        </DialogHeader>
        <SiteInfoForm form={form} onSubmit={onSubmit} isPending={addInfo.isPending} submitLabel="Add Information" />
      </DialogContent>
    </Dialog>
  );
}

function EditInfoDialog({ info, siteId }: { info: SiteInfo; siteId: number }) {
  const [open, setOpen] = useState(false);
  const updateInfo = useUpdateSiteInfo();

  const form = useForm<z.infer<typeof insertSiteInfoSchema>>({
    resolver: zodResolver(insertSiteInfoSchema),
    defaultValues: {
      siteId,
      address: info.address || "",
      mainNumber: info.mainNumber || "",
      itManager: info.itManager || "",
      numberOfUsers: info.numberOfUsers || "",
      operatingDays: info.operatingDays || "",
      openingTime: info.openingTime || "",
      closingTime: info.closingTime || "",
      otherInfo: info.otherInfo || ""
    }
  });

  const onSubmit = (data: z.infer<typeof insertSiteInfoSchema>) => {
    updateInfo.mutate({ id: info.id, siteId, ...data }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Site Information</DialogTitle>
          <DialogDescription>Update the details and operating hours for this site.</DialogDescription>
        </DialogHeader>
        <SiteInfoForm form={form} onSubmit={onSubmit} isPending={updateInfo.isPending} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}

function ActivityIcon() {
  return (
    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
