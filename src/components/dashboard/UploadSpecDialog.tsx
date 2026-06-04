import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Upload, FileCode2 } from "lucide-react";
import { uploadSpec } from "@/lib/specs";
import { SAMPLE_SPEC_YAML } from "@/lib/sample-spec";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function UploadSpecDialog({
  open,
  onOpenChange,
  orgId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orgId: string | null | undefined;
  onCreated?: (specId: string) => void;
}) {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(f: File) {
    const text = await f.text();
    setContent(text);
    if (!name) setName(f.name.replace(/\.(ya?ml|json)$/i, ""));
  }

  async function submit() {
    if (!orgId) return toast.error("No workspace found");
    if (!content.trim()) return toast.error("Paste or upload an OpenAPI spec");
    setBusy(true);
    try {
      const { spec } = await uploadSpec({ name: name || "Untitled API", content }, orgId);
      toast.success("Spec uploaded — parsing endpoints…");
      onOpenChange(false);
      setContent("");
      setName("");
      onCreated?.(spec.id);
      nav({ to: "/specs/$id", params: { id: spec.id } });
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    setContent(SAMPLE_SPEC_YAML);
    if (!name) setName("Petstore API");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-surface">
        <DialogHeader>
          <DialogTitle className="text-[18px]">Upload OpenAPI spec</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Paste YAML/JSON or drop a file. Endpoints will be parsed, a mock server will be started, and drift will be tracked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Spec name (automatically detected)"
            className="block h-10 w-full rounded-md border border-border bg-background px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <label className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background/40 py-8 cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="h-5 w-5 text-text-secondary" />
            <span className="text-[13px] text-text-secondary">Click to upload .yaml / .yml / .json</span>
            <input
              type="file"
              accept=".yaml,.yml,.json,application/json,text/yaml"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              placeholder="…or paste the spec text here"
              className="block w-full h-56 rounded-md border border-border bg-background p-3 font-mono text-[12px] text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <button
              type="button"
              onClick={loadSample}
              className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-text-secondary hover:text-foreground hover:border-border-hover"
            >
              <FileCode2 className="h-3 w-3" /> Load sample
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] hover:border-border-hover"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={submit}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-[13px] font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Upload spec
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
