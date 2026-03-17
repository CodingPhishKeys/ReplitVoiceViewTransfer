import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, ImageIcon, ExternalLink, Upload, Link2, Calendar, User2, HardDrive } from "lucide-react";
import { useState, useRef } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function openDiagram(url: string, title: string) {
  if (url.startsWith("data:")) {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
        <style>body{margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;}
        img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head>
        <body><img src="${url}" alt="${title}" /></body></html>`);
      win.document.close();
    }
  } else {
    window.open(url, "_blank");
  }
}

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
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No diagrams uploaded yet.</p>
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
                  <Button variant="secondary" className="gap-2" onClick={() => openDiagram(diagram.url, diagram.title)}>
                    <ExternalLink className="h-4 w-4" /> View Full
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base mb-1 truncate">{diagram.title}</h4>
                    {diagram.description && (
                      <p className="text-sm text-muted-foreground mb-2">{diagram.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {diagram.uploadedBy && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User2 className="h-3 w-3" /> {diagram.uploadedBy}
                        </span>
                      )}
                      {diagram.uploadedAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" /> {diagram.uploadedAt}
                        </span>
                      )}
                      {diagram.fileName && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <HardDrive className="h-3 w-3" /> {diagram.fileName}
                        </span>
                      )}
                    </div>
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

// ---- Shared diagram form ----
function DiagramForm({ form, onSubmit, isPending, submitLabel, showUpload = true }: {
  form: any;
  onSubmit: any;
  isPending: boolean;
  submitLabel: string;
  showUpload?: boolean;
}) {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("url", reader.result as string, { shouldValidate: true });
      form.setValue("fileName", file.name, { shouldValidate: false });
      // Auto-fill upload date if empty
      if (!form.getValues("uploadedAt")) {
        form.setValue("uploadedAt", new Date().toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric"
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="e.g. Rack Layout A" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Source toggle */}
        {showUpload && (
          <div>
            <p className="text-sm font-medium mb-2">Image Source</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "url" ? "default" : "outline"}
                onClick={() => setMode("url")}
                className="gap-1.5"
              >
                <Link2 className="h-3.5 w-3.5" /> External URL
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "upload" ? "default" : "outline"}
                onClick={() => { setMode("upload"); setTimeout(() => fileInputRef.current?.click(), 50); }}
                className="gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {mode === "url" ? (
          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl><Input placeholder="https://..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        ) : (
          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem>
              <FormLabel>Selected File</FormLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {form.watch("fileName") ? "Change File" : "Choose File"}
                </Button>
                {form.watch("fileName") && (
                  <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {form.watch("fileName")}
                  </span>
                )}
              </div>
              {field.value && field.value.startsWith("data:") && (
                <img src={field.value} alt="Preview" className="mt-2 rounded-lg max-h-40 object-contain border border-border" />
              )}
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What does this diagram show?"
                className="resize-none"
                rows={2}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="uploadedBy" render={({ field }) => (
            <FormItem>
              <FormLabel>Uploaded By</FormLabel>
              <FormControl><Input placeholder="Your name" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="uploadedAt" render={({ field }) => (
            <FormItem>
              <FormLabel>Date Uploaded</FormLabel>
              <FormControl><Input placeholder="e.g. 13 Mar 2026" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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
    defaultValues: {
      title: "", url: "", description: "",
      uploadedBy: "", uploadedAt: "", fileName: ""
    }
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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Network Diagram</DialogTitle>
          <DialogDescription>Upload a file from your computer or provide an external URL.</DialogDescription>
        </DialogHeader>
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
      description: diagram.description || "",
      uploadedBy: diagram.uploadedBy || "",
      uploadedAt: diagram.uploadedAt || "",
      fileName: diagram.fileName || "",
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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Diagram</DialogTitle>
          <DialogDescription>Update the diagram details or replace the image.</DialogDescription>
        </DialogHeader>
        <DiagramForm form={form} onSubmit={onSubmit} isPending={updateDiagram.isPending} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
