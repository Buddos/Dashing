import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, MailOpen, Reply } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    setReply(msg.admin_reply || "");
    if (msg.status === "unread") {
      await supabase
        .from("contact_messages")
        .update({ status: "read", updated_at: new Date().toISOString() })
        .eq("id", msg.id);
      fetchMessages();
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({
        admin_reply: reply,
        status: "replied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reply saved" });
      setSelected(null);
      fetchMessages();
    }
  };

  const statusColor: Record<string, string> = {
    unread: "bg-blue-100 text-blue-700",
    read: "bg-accent/10 text-accent-foreground",
    replied: "bg-green-100 text-green-700",
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Message Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {unreadCount} unread • {messages.length} total messages
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No messages yet</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`border-border/50 cursor-pointer hover:shadow-sm transition-shadow ${
                msg.status === "unread" ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => openMessage(msg)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                  {msg.status === "unread" ? (
                    <Mail className="h-4 w-4 text-primary" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${msg.status === "unread" ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {msg.subject || "(No subject)"}
                    </p>
                    <Badge variant="outline" className={statusColor[msg.status] || ""}>
                      {msg.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {msg.name} ({msg.email}) • {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject || "(No subject)"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">From</p>
                  <p className="font-medium text-foreground">{selected.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{selected.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Date</p>
                  <p className="text-foreground">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Reply className="h-3 w-3" /> Admin Reply
                </p>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button onClick={sendReply} disabled={saving || !reply.trim()}>
                    {saving ? "Saving…" : "Save Reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
