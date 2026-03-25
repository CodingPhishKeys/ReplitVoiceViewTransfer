import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, FileText, ExternalLink, Tag, User2, Calendar } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDocumentSchema, documentCategories, type SiteDocument } from "@shared/schema";
import { useAddDocument, useUpdateDocument, useDeleteDocument } from "@/hooks/use-voiceview";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categoryColors: Record<string, string> = {
  SOP: "bg-blue-100 text-blue-700 border-blue-200",
  Runbook: "bg-orange-100 text-orange-700 border-orange-200",
  Architecture: "bg-purple-100 text-purple-700 border-purple-200",
  Policy: "bg-red-100 text-red-700 border-red-200",
  Guide: "bg-green-100 text-green-700 border-green-200",
  Reference: "bg-slate-100 text-slate-700 border-slate-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
};

export function SiteDocuments({ siteId, documents }: { siteId: number; documents: SiteDocument[] }) {
  const deleteDocument = useDeleteDocument();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Documentation
        </h3>
        <AddDocumentDialog siteId={siteId} />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents added yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add SOPs, runbooks, architecture docs, or any reference material.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} siteId={siteId} onDelete={() => deleteDocument.mutate(doc.id)} isDeleting={deleteDocument.isPending} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc, siteId, onDelete, isDeleting }: {
  doc: SiteDocument;
  siteId: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="group border border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {doc.category && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[doc.category] || categoryColors.Other}`}>
                  {doc.category}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-base leading-tight mb-1 truncate">{doc.title}</h4>
            {doc.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{doc.description}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {doc.addedBy && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User2 className="h-3 w-3" /> {doc.addedBy}
                </span>
              )}
              {doc.addedAt && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {doc.addedAt}
                </span>
              )}
            </div>
            {doc.url && (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Document
              </a>
            )}
          </div>
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditDocumentDialog doc={doc} siteId={siteId} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentForm({ form, onSubmit, isPending, submitLabel }: {
  form: any;
  onSubmit: any;
  isPending: boolean;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Document Title</FormLabel>
            <FormControl><Input placeholder="e.g. Teams Direct Routing SOP" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {documentCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of what this document covers..."
                className="resize-none"
                rows={3}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel>Document Link (URL)</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="addedBy" render={({ field }) => (
            <FormItem>
              <FormLabel>Added By</FormLabel>
              <FormControl><Input placeholder="Your name" {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="addedAt" render={({ field }) => (
            <FormItem>
              <FormLabel>Date Added</FormLabel>
              <FormControl><Input placeholder="e.g. 17 Mar 2026" {...field} value={field.value || ""} /></FormControl>
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

function AddDocumentDialog({ siteId }: { siteId: number }) {
  const [open, setOpen] = useState(false);
  const addDocument = useAddDocument();

  const form = useForm<z.infer<typeof insertDocumentSchema>>({
    resolver: zodResolver(insertDocumentSchema.omit({ siteId: true })),
    defaultValues: { title: "", description: "", url: "", category: "", addedBy: "", addedAt: "" }
  });

  const onSubmit = (data: any) => {
    addDocument.mutate({ siteId, ...data }, {
      onSuccess: () => { setOpen(false); form.reset(); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Add Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>Link an SOP, runbook, architecture doc, or any reference material for this site.</DialogDescription>
        </DialogHeader>
        <DocumentForm form={form} onSubmit={onSubmit} isPending={addDocument.isPending} submitLabel="Add Document" />
      </DialogContent>
    </Dialog>
  );
}

function EditDocumentDialog({ doc, siteId }: { doc: SiteDocument; siteId: number }) {
  const [open, setOpen] = useState(false);
  const updateDocument = useUpdateDocument();

  const form = useForm<z.infer<typeof insertDocumentSchema>>({
    resolver: zodResolver(insertDocumentSchema.omit({ siteId: true })),
    defaultValues: {
      title: doc.title,
      description: doc.description || "",
      url: doc.url || "",
      category: doc.category || "",
      addedBy: doc.addedBy || "",
      addedAt: doc.addedAt || "",
    }
  });

  const onSubmit = (data: any) => {
    updateDocument.mutate({ id: doc.id, siteId, ...data }, {
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>Update the document details or link.</DialogDescription>
        </DialogHeader>
        <DocumentForm form={form} onSubmit={onSubmit} isPending={updateDocument.isPending} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
