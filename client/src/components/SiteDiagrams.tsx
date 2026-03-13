import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, ImageIcon, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDiagramSchema, type SiteDiagram } from "@shared/schema";
import { useAddDiagram, useUpdateDiagram, useDeleteDiagram } from "@/hooks/use-voiceview";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SiteDiagrams({ siteId, diagrams }: { siteId: number, diagrams: SiteDiagram[] }) {
  const deleteDiagram = useDeleteDiagram();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Network Diagrams
        </h3>
        <AddDiagramDialog siteId={siteId} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {diagrams.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No diagrams uploaded.</p>
          </div>
        ) : (
          diagrams.map((diagram) => (
            <Card key={diagram.id} className="overflow-hidden group">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                <img
                  src={diagram.url}
                  alt={diagram.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Diagram";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" className="gap-2" onClick={() => window.open(diagram.url, '_blank')}>
                    <ExternalLink className="h-4 w-4" /> View Full
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">{diagram.title}</h4>
                    <p className="text-sm text-muted-foreground">{diagram.description || "No description provided."}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditDiagramDialog diagram={diagram} siteId={siteId} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteDiagram.mutate(diagram.id)}
                      disabled={deleteDiagram.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

function DiagramForm({ form, onSubmit, isPending, submitLabel }: { form: any; onSubmit: any; isPending: boolean; submitLabel: string }) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="e.g. Rack Layout A" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel>Image / Document URL</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Details about this diagram..." {...field} value={field.value || ''} /></FormControl>
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

function AddDiagramDialog({ siteId }: { siteId: number }) {
  const [open, setOpen] = useState(false);
  const addDiagram = useAddDiagram();
  const form = useForm<z.infer<typeof insertDiagramSchema>>({
    resolver: zodResolver(insertDiagramSchema.omit({ siteId: true })),
    defaultValues: { title: "", url: "", description: "" }
  });

  const onSubmit = (data: any) => {
    addDiagram.mutate({ siteId, ...data }, {
      onSuccess: () => { setOpen(false); form.reset(); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Diagram</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Diagram Link</DialogTitle></DialogHeader>
        <DiagramForm form={form} onSubmit={onSubmit} isPending={addDiagram.isPending} submitLabel="Add Diagram" />
      </DialogContent>
    </Dialog>
  );
}

function EditDiagramDialog({ diagram, siteId }: { diagram: SiteDiagram; siteId: number }) {
  const [open, setOpen] = useState(false);
  const updateDiagram = useUpdateDiagram();
  const form = useForm<z.infer<typeof insertDiagramSchema>>({
    resolver: zodResolver(insertDiagramSchema.omit({ siteId: true })),
    defaultValues: {
      title: diagram.title,
      url: diagram.url,
      description: diagram.description || ""
    }
  });

  const onSubmit = (data: any) => {
    updateDiagram.mutate({ id: diagram.id, siteId, ...data }, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Diagram</DialogTitle></DialogHeader>
        <DiagramForm form={form} onSubmit={onSubmit} isPending={updateDiagram.isPending} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
