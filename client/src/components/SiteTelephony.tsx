import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTelephonySchema, type SiteTelephony as SiteTelephonyType, telephonySystems } from "@shared/schema";
import { useAddTelephony } from "@/hooks/use-voiceview";
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

export function SiteTelephony({ siteId, telephony }: { siteId: number, telephony: SiteTelephonyType[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Telephony Systems
        </h3>
        <AddTelephonyDialog siteId={siteId} />
      </div>

      <div className="grid gap-6">
        {telephony.length === 0 ? (
           <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
           <p className="text-muted-foreground">No telephony systems configured.</p>
         </div>
        ) : (
          telephony.map((sys) => (
            <Card key={sys.id} className="overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="font-bold text-lg">{sys.platform}</div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded text-white/90">System ID: {sys.id}</div>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground uppercase mb-2">Number Ranges</h4>
                    <div className="flex flex-wrap gap-2">
                      {sys.numberRanges.map((range, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {range}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AddTelephonyDialog({ siteId }: { siteId: number }) {
  const [open, setOpen] = useState(false);
  const addTelephony = useAddTelephony();
  const form = useForm<z.infer<typeof insertTelephonySchema>>({
    resolver: zodResolver(insertTelephonySchema.omit({ siteId: true })),
    defaultValues: {
      platform: "Microsoft Teams",
      numberRanges: []
    }
  });

  const [rangesInput, setRangesInput] = useState("");

  const onSubmit = (data: any) => {
    // Convert comma-separated string to array
    const ranges = rangesInput.split(',').map(s => s.trim()).filter(Boolean);
    addTelephony.mutate({ siteId, ...data, numberRanges: ranges }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setRangesInput("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" /> Add System
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Telephony System</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {telephonySystems.map(sys => (
                        <SelectItem key={sys} value={sys}>{sys}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Number Ranges (comma separated)
              </label>
              <Input 
                value={rangesInput}
                onChange={(e) => setRangesInput(e.target.value)}
                placeholder="+44 1234 567890, +44 9876..."
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Enter ranges separated by commas
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={addTelephony.isPending}>
              {addTelephony.isPending ? "Adding..." : "Add System"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
