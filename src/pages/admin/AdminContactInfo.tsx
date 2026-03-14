import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactEntry {
  id: string;
  key: string;
  value: string;
}

export default function AdminContactInfo() {
  const [entries, setEntries] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase.from("contact_info").select("*").order("key");
    setEntries(data || []);
    setLoading(false);
  };

  const updateEntry = async (id: string, value: string) => {
    setSaving(id);
    const { error } = await supabase
      .from("contact_info")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSaving(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated" });
    }
  };

  const addEntry = async () => {
    if (!newKey.trim()) return;
    const { error } = await supabase.from("contact_info").insert({ key: newKey, value: newValue });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added" });
      setNewKey("");
      setNewValue("");
      fetchEntries();
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const { error } = await supabase.from("contact_info").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchEntries();
    }
  };

  const formatKey = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage business contact details displayed on the site
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium text-foreground">{formatKey(entry.key)}</p>
                </div>
                <Input
                  defaultValue={entry.value}
                  onBlur={(e) => {
                    if (e.target.value !== entry.value) {
                      updateEntry(entry.id, e.target.value);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive shrink-0"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <Input
                placeholder="Key (e.g. twitter)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-32 shrink-0"
              />
              <Input
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1"
              />
              <Button size="icon" onClick={addEntry} disabled={!newKey.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
