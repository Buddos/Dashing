import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  sort_order: number;
  is_founder: boolean;
}

const emptyForm = {
  name: "",
  role: "",
  bio: "",
  image_url: "",
  email: "",
  sort_order: "0",
  is_founder: false,
};

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role,
      bio: m.bio || "",
      image_url: m.image_url || "",
      email: m.email || "",
      sort_order: String(m.sort_order),
      is_founder: m.is_founder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      role: form.role,
      bio: form.bio || null,
      image_url: form.image_url || null,
      email: form.email || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_founder: form.is_founder,
    };

    if (editing) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Member updated" });
      }
    } else {
      const { error } = await supabase.from("team_members").insert(payload);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Member added" });
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchMembers();
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Member removed" });
      fetchMembers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} team members
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No team members yet</p>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="h-12 w-12 rounded-full object-cover bg-muted"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent-foreground font-semibold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{m.name}</p>
                    {m.is_founder && (
                      <Badge variant="outline" className="bg-primary/10 text-primary text-[10px]">
                        Founder
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                  {m.email && (
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteMember(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Role / Title</label>
              <Input
                placeholder="e.g. CEO, Designer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Sort Order</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.is_founder}
                onCheckedChange={(checked) => setForm({ ...form, is_founder: !!checked })}
              />
              <label className="text-sm text-foreground">Founder</label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
