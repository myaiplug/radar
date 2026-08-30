import { useState } from "react";
import { toast } from "sonner";
import { useAccess, useLeadMutations, useServices } from "@/lib/radar/hooks";
import { SOURCES, STAGES } from "@/lib/radar/types";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

export function NewLeadDialog({ triggerLabel = "New lead" }: { triggerLabel?: string }) {
  const { data: services = [] } = useServices();
  const { data: access } = useAccess();
  const { create } = useLeadMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [source, setSource] = useState("manual");
  const [serviceId, setServiceId] = useState("");
  const [valueUsd, setValueUsd] = useState("");
  const [why, setWhy] = useState("");

  function reset() {
    setName("");
    setCompany("");
    setContact("");
    setPostUrl("");
    setSource("manual");
    setServiceId("");
    setValueUsd("");
    setWhy("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>New lead</DialogTitle>
        <DialogDescription>Park a name on the board. You can flesh it out later.</DialogDescription>
        <form
          className="mt-5 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            if (access && !access.canSave) {
              toast.error("Free desk holds 2 leads. Unlock $5 to keep more.");
              return;
            }
            create.mutate(
              {
                name,
                company,
                contact,
                postUrl,
                source,
                serviceId: serviceId ? Number(serviceId) : null,
                valueUsd: Number(valueUsd) || 0,
                why,
                stage: STAGES[0].id,
              },
              {
                onSuccess: () => {
                  toast.success("Lead saved");
                  reset();
                  setOpen(false);
                },
                onError: (err) => toast.error(err.message),
              },
            );
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="lead-name">Name</Label>
            <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="lead-company">Company / act</Label>
              <Input id="lead-company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-contact">Handle or link</Label>
              <Input id="lead-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lead-post">Source post URL</Label>
            <Input
              id="lead-post"
              type="url"
              inputMode="url"
              placeholder="https://x.com/.../status/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
            <p className="text-xs text-subtle">Direct permalink. You will open it to read replies before pitching.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="lead-source">Source</Label>
              <Select id="lead-source" value={source} onChange={(e) => setSource(e.target.value)}>
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-service">Offer</Label>
              <Select id="lead-service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="">Unassigned</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="lead-value">Value USD</Label>
              <Input
                id="lead-value"
                inputMode="numeric"
                value={valueUsd}
                onChange={(e) => setValueUsd(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="lead-why">Why they might buy</Label>
            <Textarea id="lead-why" value={why} onChange={(e) => setWhy(e.target.value)} className="min-h-20" />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? "Saving" : "Save lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
