import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Phone, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertTelephonySchema,
  type SiteTelephony as SiteTelephonyType,
  type NumberRange,
  telephonySystems,
} from "@shared/schema";
import { useAddTelephony, useUpdateTelephony, useDeleteTelephony } from "@/hooks/use-voiceview";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ---- Collapsible Telephony Card ----
function TelephonyCard({ sys, siteId }: { sys: SiteTelephonyType; siteId: number }) {
  const [expanded, setExpanded] = useState(false);
  const deleteTelephony = useDeleteTelephony();
  const ranges = (sys.numberRanges as NumberRange[]) || [];

  return (
    <Card className="overflow-hidden group">
      {/* Header – always visible */}
      <div
        className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-bold text-base">{sys.platform}</span>
          {!expanded && ranges.length > 0 && (
            <span className="text-xs text-slate-400 ml-2">
              {ranges.length} range{ranges.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/80">ID: {sys.id}</span>
          {/* Edit/Delete – only visible on hover, stop propagation so click doesn't toggle */}
          <div
            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <EditTelephonyDialog sys={sys} siteId={siteId} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-red-400 hover:bg-white/10"
              onClick={() => deleteTelephony.mutate(sys.id)}
              disabled={deleteTelephony.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="p-5 space-y-5">
          {/* Info tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Voice Service Provider</p>
              <p className="text-sm font-medium">
                {sys.voiceServiceProvider || <span className="italic text-muted-foreground">Not specified</span>}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Type of Routing</p>
              <p className="text-sm font-medium">
                {sys.typeOfRouting || <span className="italic text-muted-foreground">Not specified</span>}
              </p>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Block Size</p>
              <p className="text-sm font-medium">
                {sys.blockSize || <span className="italic text-muted-foreground">Not specified</span>}
              </p>
            </div>
          </div>

          {/* Number Ranges Table */}
          {ranges.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Number Ranges</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground w-10">#</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Start Range</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground">End Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranges.map((r, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-2 font-mono">{r.start}</td>
                        <td className="px-4 py-2 font-mono">{r.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No number ranges configured.</p>
          )}
        </div>
      )}
    </Card>
  );
}

export function SiteTelephony({ siteId, telephony }: { siteId: number; telephony: SiteTelephonyType[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Telephony Systems
        </h3>
        <AddTelephonyDialog siteId={siteId} />
      </div>

      <div className="grid gap-3">
        {telephony.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No telephony systems configured.</p>
          </div>
        ) : (
          telephony.map((sys) => (
            <TelephonyCard key={sys.id} sys={sys} siteId={siteId} />
          ))
        )}
      </div>
    </div>
  );
}

// ---- Number Ranges Editor (Start + End) ----
function NumberRangesEditor({ ranges, onChange }: { ranges: NumberRange[]; onChange: (v: NumberRange[]) => void }) {
  const addRow = () => onChange([...ranges, { start: "", end: "" }]);
  const removeRow = (i: number) => onChange(ranges.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof NumberRange, val: string) => {
    onChange(ranges.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Number Ranges</label>
        <Button type="button" size="sm" variant="outline" onClick={addRow} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Row
        </Button>
      </div>
      {ranges.length === 0 ? (
        <p className="text-xs text-muted-foreground">No ranges added yet. Click "Add Row" to start.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-8">#</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Start Range</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">End Range</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {ranges.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="px-3 py-1 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-2 py-1">
                    <Input
                      value={r.start}
                      onChange={(e) => updateRow(i, "start", e.target.value)}
                      placeholder="+44 1234 560000"
                      className="h-7 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono px-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      value={r.end}
                      onChange={(e) => updateRow(i, "end", e.target.value)}
                      placeholder="+44 1234 560099"
                      className="h-7 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-mono px-1"
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRow(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Shared form ----
function TelephonyForm({ form, ranges, setRanges, onSubmit, isPending, submitLabel }: {
  form: any;
  ranges: NumberRange[];
  setRanges: (v: NumberRange[]) => void;
  onSubmit: any;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="platform" render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {telephonySystems.map(sys => (
                    <SelectItem key={sys} value={sys}>{sys}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="voiceServiceProvider" render={({ field }) => (
            <FormItem>
              <FormLabel>Voice Service Provider</FormLabel>
              <FormControl><Input placeholder="e.g. BT, Gamma" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="typeOfRouting" render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Routing</FormLabel>
              <FormControl><Input placeholder="e.g. SIP, Direct Routing" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="blockSize" render={({ field }) => (
            <FormItem>
              <FormLabel>Block Size</FormLabel>
              <FormControl><Input placeholder="e.g. 100, 1000" {...field} value={field.value || ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <NumberRangesEditor ranges={ranges} onChange={setRanges} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

// ---- Add dialog ----
function AddTelephonyDialog({ siteId }: { siteId: number }) {
  const [open, setOpen] = useState(false);
  const [ranges, setRanges] = useState<NumberRange[]>([]);
  const addTelephony = useAddTelephony();

  const form = useForm<z.infer<typeof insertTelephonySchema>>({
    resolver: zodResolver(insertTelephonySchema.omit({ siteId: true })),
    defaultValues: { platform: "Microsoft Teams", numberRanges: [], blockSize: "", voiceServiceProvider: "", typeOfRouting: "" }
  });

  const onSubmit = (data: any) => {
    addTelephony.mutate({ siteId, ...data, numberRanges: ranges }, {
      onSuccess: () => { setOpen(false); form.reset(); setRanges([]); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add System</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Telephony System</DialogTitle></DialogHeader>
        <TelephonyForm form={form} ranges={ranges} setRanges={setRanges} onSubmit={onSubmit} isPending={addTelephony.isPending} submitLabel="Add System" />
      </DialogContent>
    </Dialog>
  );
}

// ---- Edit dialog ----
function EditTelephonyDialog({ sys, siteId }: { sys: SiteTelephonyType; siteId: number }) {
  const [open, setOpen] = useState(false);
  const [ranges, setRanges] = useState<NumberRange[]>((sys.numberRanges as NumberRange[]) || []);
  const updateTelephony = useUpdateTelephony();

  const form = useForm<z.infer<typeof insertTelephonySchema>>({
    resolver: zodResolver(insertTelephonySchema.omit({ siteId: true })),
    defaultValues: {
      platform: sys.platform,
      numberRanges: (sys.numberRanges as NumberRange[]) || [],
      blockSize: sys.blockSize || "",
      voiceServiceProvider: sys.voiceServiceProvider || "",
      typeOfRouting: sys.typeOfRouting || ""
    }
  });

  const onSubmit = (data: any) => {
    updateTelephony.mutate({ id: sys.id, siteId, ...data, numberRanges: ranges }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setRanges((sys.numberRanges as NumberRange[]) || []); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Telephony System</DialogTitle></DialogHeader>
        <TelephonyForm form={form} ranges={ranges} setRanges={setRanges} onSubmit={onSubmit} isPending={updateTelephony.isPending} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
