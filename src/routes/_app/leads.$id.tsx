import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useDrafts, useLead, useLeadMutations, useOutreach, useServices, useAccess } from "@/lib/radar/hooks";
import { CHANNELS, SOURCES, STAGES, type ChannelId } from "@/lib/radar/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { stageTone } from "@/lib/radar/ui";
import { SourcePost } from "@/components/post-link";
import { UnlockCard } from "@/components/unlock-card";

export const Route = createFileRoute("/_app/leads/$id")({ component: LeadPage });

function LeadPage() {
  const { id } = Route.useParams();
  const leadId = Number(id);
  const { data: lead, isLoading } = useLead(leadId);
  const { data: access } = useAccess();
  const { data: services = [] } = useServices();
  const { data: drafts = [] } = useDrafts(leadId);
  const { update, remove } = useLeadMutations();
  const outreach = useOutreach();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [contact, setContact] = useState("");
  const [source, setSource] = useState("manual");
  const [serviceId, setServiceId] = useState("");
  const [stage, setStage] = useState("new");
  const [valueUsd, setValueUsd] = useState("0");
  const [score, setScore] = useState("50");
  const [why, setWhy] = useState("");
  const [angle, setAngle] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [followUpOn, setFollowUpOn] = useState("");
  const [notes, setNotes] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postQuote, setPostQuote] = useState("");
  const [channel, setChannel] = useState<ChannelId>("dm");
  const [extra, setExtra] = useState("");
  const [draftBody, setDraftBody] = useState("");

  useEffect(() => {
    if (!lead) return;
    setName(lead.name);
    setCompany(lead.company);
    setRoleTitle(lead.roleTitle);
    setContact(lead.contact);
    setSource(lead.source);
    setServiceId(lead.serviceId ? String(lead.serviceId) : "");
    setStage(lead.stage);
    setValueUsd(String(lead.valueUsd));
    setScore(String(lead.score));
    setWhy(lead.why);
    setAngle(lead.angle);
    setNextAction(lead.nextAction);
    setFollowUpOn(lead.followUpOn ?? "");
    setNotes(lead.notes);
    setPostUrl(lead.postUrl);
    setPostQuote(lead.postQuote);
  }, [lead]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div>
        <h1 className="font-display text-4xl">Lead not found</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/board">Back to board</Link>
        </Button>
      </div>
    );
  }

  function payload() {
    return {
      id: leadId,
      name,
      company,
      roleTitle,
      contact,
      source,
      serviceId: serviceId ? Number(serviceId) : null,
      stage: stage as (typeof STAGES)[number]["id"],
      valueUsd: Number(valueUsd) || 0,
      score: Number(score) || 0,
      why,
      angle,
      nextAction,
      followUpOn: followUpOn || null,
      notes,
      postUrl,
      postQuote,
    };
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/board" className="text-xs text-muted hover:text-fg">
            Board
          </Link>
          <h1 className="mt-2 font-display text-4xl leading-none">{lead.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone={stageTone(lead.stage)}>{STAGES.find((s) => s.id === lead.stage)?.label}</Badge>
            {lead.serviceName ? <Badge>{lead.serviceName}</Badge> : null}
          </div>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            if (!window.confirm("Delete this lead?")) return;
            remove.mutate(leadId, {
              onSuccess: () => {
                toast.success("Deleted");
                void navigate({ to: "/board" });
              },
              onError: (err) => toast.error(err.message),
            });
          }}
        >
          Delete
        </Button>
      </div>

      <Card className="mt-6 rounded-xl p-4">
        <p className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">Source post</p>
        <p className="mt-1 text-sm text-muted">Proof, full thread, other replies. Open it before you pitch.</p>
        {lead.locked ? (
          <p className="mt-3 text-sm text-warn">Post went dark with the rest of the desk.</p>
        ) : postUrl ? (
          <SourcePost
            url={postUrl}
            quote={postQuote}
            inspectable={access?.canInspect ?? false}
            className="mt-4"
            onQuote={(next) => {
              if (!postQuote) setPostQuote(next);
            }}
          />
        ) : (
          <p className="mt-3 text-sm text-subtle">No post URL yet. Paste one below so you can jump the thread.</p>
        )}
      </Card>

      {lead.locked ? (
        <div className="mt-6 max-w-xl">
          <UnlockCard
            title="This lead went dark"
            body="The name is still here. Unlock the desk to bring back the post, the handle, and the pitch writer."
          />
        </div>
      ) : null}

      <form
        className="mt-8 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate(payload(), {
            onSuccess: () => toast.success("Saved"),
            onError: (err) => toast.error(err.message),
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Company / act">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
          </Field>
          <Field label="Handle or link">
            <Input value={contact} onChange={(e) => setContact(e.target.value)} />
          </Field>
          <Field label="Source post URL">
            <Input
              type="url"
              inputMode="url"
              placeholder="https://x.com/.../status/..."
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
            />
          </Field>
          <Field label="Source">
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              {SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Offer">
            <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="">Unassigned</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Stage">
            <Select value={stage} onChange={(e) => setStage(e.target.value)}>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Value USD">
              <Input inputMode="numeric" value={valueUsd} onChange={(e) => setValueUsd(e.target.value)} />
            </Field>
            <Field label="Score">
              <Input inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="What they posted">
          <Textarea
            className="min-h-20"
            value={postQuote}
            onChange={(e) => setPostQuote(e.target.value)}
            placeholder="Paste the ask from the post"
          />
        </Field>
        <Field label="Why they might buy">
          <Textarea className="min-h-20" value={why} onChange={(e) => setWhy(e.target.value)} />
        </Field>
        <Field label="Angle">
          <Textarea className="min-h-20" value={angle} onChange={(e) => setAngle(e.target.value)} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Next action">
            <Input value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
          </Field>
          <Field label="Follow up on">
            <Input type="date" value={followUpOn} onChange={(e) => setFollowUpOn(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div>
          <Button type="submit" disabled={update.isPending || Boolean(lead.locked)}>
            {update.isPending ? "Saving" : "Save lead"}
          </Button>
        </div>
      </form>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Write the pitch</h2>
        <p className="mt-2 text-sm text-muted">One offer. One sample. One ask.</p>
        {!access ? null : !access.canOutreach ? (
          <div className="mt-4 max-w-xl">
            <UnlockCard
              title="Pitch writer is locked"
              body="You can open the source post on the free desk. The writer that turns it into a DM unlocks with the desk."
            />
          </div>
        ) : (
          <Card className="mt-4 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  className={`h-11 rounded-full px-3.5 text-sm ${
                    channel === c.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Field label="Writer notes" className="mt-4">
              <Input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Mention a specific track, flyer, or site"
              />
            </Field>
            <Button
              className="mt-4"
              type="button"
              disabled={outreach.write.isPending}
              onClick={() => {
                outreach.write.mutate(
                  { leadId, channel, extra },
                  {
                    onSuccess: (res) => {
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setDraftBody(res.body);
                    },
                    onError: (err) => toast.error(err.message),
                  },
                );
              }}
            >
              {outreach.write.isPending ? "Writing" : "Write outreach"}
            </Button>
            {draftBody ? (
              <div className="mt-4 grid gap-3">
                <Textarea className="min-h-40" value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(draftBody);
                        toast.success("Copied");
                      } catch {
                        toast.error("Could not copy");
                      }
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={outreach.save.isPending}
                    onClick={() =>
                      outreach.save.mutate(
                        { leadId, channel, body: draftBody },
                        {
                          onSuccess: () => toast.success("Draft saved"),
                          onError: (err) => toast.error(err.message),
                        },
                      )
                    }
                  >
                    Save draft
                  </Button>
                  {postUrl ? (
                    <Button asChild variant="ghost">
                      <a href={postUrl} target="_blank" rel="noreferrer noopener">
                        Reply on the post
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Card>
        )}

        {drafts.length > 0 ? (
          <div className="mt-6 grid gap-3">
            <h3 className="text-sm font-medium text-muted">Saved drafts</h3>
            {drafts.map((d) => (
              <Card key={d.id} className="rounded-lg p-4">
                <p className="text-xs text-subtle">
                  {CHANNELS.find((c) => c.id === d.channel)?.label} · {d.createdAt.slice(0, 10)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{d.body}</p>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}
