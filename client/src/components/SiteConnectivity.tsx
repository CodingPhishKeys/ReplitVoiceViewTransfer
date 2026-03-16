import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Wifi, Server, User, Globe, Plus, X, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConnectivitySchema, type SiteConnectivity as SiteConnectivityType, type ContactEntry } from "@shared/schema";
import { useUpdateConnectivity } from "@/hooks/use-voiceview";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Props {
  siteId: number;
  data: SiteConnectivityType | null;
}

// ---- Contact List Editor ----
function ContactsEditor({ contacts, onChange, label }: {
  contacts: ContactEntry[];
  onChange: (v: ContactEntry[]) => void;
  label: string;
}) {
  const addContact = () => onChange([...contacts, { name: "", email: "", phone: "" }]);
  const removeContact = (i: number) => onChange(contacts.filter((_, idx) => idx !== i));
  const updateContact = (i: number, field: keyof ContactEntry, val: string) => {
    const updated = contacts.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Button type="button" size="sm" variant="outline" onClick={addContact} className="h-7 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Contact
        </Button>
      </div>
      {contacts.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No contacts added yet.</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact, i) => (
            <div key={i} className="border border-border rounded-lg p-3 relative bg-muted/20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => removeContact(i)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="space-y-2 pr-8">
                <Input
                  placeholder="Contact name"
                  value={contact.name}
                  onChange={(e) => updateContact(i, "name", e.target.value)}
                  className="h-8 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Mail className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Email address"
                      value={contact.email}
                      onChange={(e) => updateContact(i, "email", e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => updateContact(i, "phone", e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteConnectivity({ siteId, data }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const updateConnectivity = useUpdateConnectivity();

  const defaultContacts: ContactEntry[] = [];

  const [ispContacts, setIspContacts] = useState<ContactEntry[]>(
    (data?.ispContacts as ContactEntry[]) || defaultContacts
  );
  const [localItContacts, setLocalItContacts] = useState<ContactEntry[]>(
    (data?.localItContacts as ContactEntry[]) || defaultContacts
  );

  const form = useForm<z.infer<typeof insertConnectivitySchema>>({
    resolver: zodResolver(insertConnectivitySchema.omit({ siteId: true })),
    defaultValues: {
      linkType: data?.linkType || "",
      ispName: data?.ispName || "",
      ispContacts: (data?.ispContacts as ContactEntry[]) || [],
      localItContacts: (data?.localItContacts as ContactEntry[]) || [],
    }
  });

  const onSubmit = (values: any) => {
    updateConnectivity.mutate(
      { siteId, ...values, ispContacts, localItContacts },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const startEditing = () => {
    setIspContacts((data?.ispContacts as ContactEntry[]) || []);
    setLocalItContacts((data?.localItContacts as ContactEntry[]) || []);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <Card className="shadow-md border-primary/20">
        <CardHeader>
          <CardTitle>Edit Connectivity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="linkType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Type</FormLabel>
                    <FormControl><Input placeholder="e.g. MPLS, Fiber, 5G" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ispName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISP Name</FormLabel>
                    <FormControl><Input placeholder="e.g. BT, Verizon" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/20">
                <ContactsEditor
                  contacts={ispContacts}
                  onChange={setIspContacts}
                  label="ISP Contacts"
                />
              </div>

              <div className="border border-border rounded-xl p-4 space-y-2 bg-muted/20">
                <ContactsEditor
                  contacts={localItContacts}
                  onChange={setLocalItContacts}
                  label="Local IT Contacts"
                />
              </div>

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
        <Button onClick={startEditing}>Add Details</Button>
      </div>
    );
  }

  const storedIspContacts = (data.ispContacts as ContactEntry[]) || [];
  const storedLocalContacts = (data.localItContacts as ContactEntry[]) || [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Primary Link Card */}
      <Card className="md:col-span-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Primary Link
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={startEditing}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Connection Type</p>
              <div className="text-2xl font-bold text-foreground mt-1">{data.linkType}</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Service Provider</p>
              <div className="text-2xl font-bold text-foreground mt-1">{data.ispName}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ISP Contacts */}
      <Card className="shadow-sm border-l-4 border-l-slate-400">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" /> ISP Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storedIspContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No ISP contacts on file.</p>
          ) : (
            <div className="space-y-3">
              {storedIspContacts.map((c, i) => (
                <ContactCard key={i} contact={c} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Local IT Contacts */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" /> Local IT Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storedLocalContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No local IT contacts on file.</p>
          ) : (
            <div className="space-y-3">
              {storedLocalContacts.map((c, i) => (
                <ContactCard key={i} contact={c} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactCard({ contact }: { contact: ContactEntry }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 space-y-1">
      {contact.name && <p className="font-medium text-sm">{contact.name}</p>}
      {contact.email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <a href={`mailto:${contact.email}`} className="hover:text-foreground hover:underline truncate">
            {contact.email}
          </a>
        </div>
      )}
      {contact.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <a href={`tel:${contact.phone}`} className="hover:text-foreground hover:underline">
            {contact.phone}
          </a>
        </div>
      )}
    </div>
  );
}
