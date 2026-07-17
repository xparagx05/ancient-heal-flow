import { useEffect, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { adminNav } from "./AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Row = { key: string; value: any };

const SECTIONS = ["hero", "pricing", "founders", "footer"];

export default function AdminCMS() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_content").select("key, value");
      const map: Record<string, Row> = {};
      const drafts: Record<string, string> = {};
      for (const r of data ?? []) {
        map[r.key] = r as Row;
        drafts[r.key] = JSON.stringify(r.value, null, 2);
      }
      // Ensure all sections exist in drafts
      for (const s of SECTIONS) if (!drafts[s]) drafts[s] = "{}";
      setRows(map);
      setDrafts(drafts);
    })();
  }, []);

  const save = async (key: string) => {
    let parsed: any;
    try { parsed = JSON.parse(drafts[key]); }
    catch (e: any) { toast({ title: "Invalid JSON", description: e.message, variant: "destructive" }); return; }
    setSaving(key);
    const { error } = await supabase.from("site_content")
      .upsert({ key, value: parsed, updated_by: user?.id }, { onConflict: "key" });
    setSaving(null);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Saved", description: `${key} content updated.` });
    setRows({ ...rows, [key]: { key, value: parsed } });
  };

  return (
    <PortalShell title="Content Management" accent="Admin Control" nav={adminNav}>
      <div className="glass rounded-2xl p-4 mb-5 text-xs text-muted-foreground">
        Edit landing page copy as JSON. Changes save to <span className="font-mono">site_content</span> and can be wired
        into the landing sections in a follow-up pass without changing the current design.
      </div>

      <div className="space-y-5">
        {SECTIONS.map((s) => (
          <div key={s} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg capitalize">{s}</h3>
              <button onClick={() => save(s)} disabled={saving === s}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-background text-xs uppercase tracking-widest disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving === s ? "Saving…" : "Save"}
              </button>
            </div>
            <textarea
              value={drafts[s] ?? ""}
              onChange={(e) => setDrafts({ ...drafts, [s]: e.target.value })}
              rows={10}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-xs text-foreground"
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
